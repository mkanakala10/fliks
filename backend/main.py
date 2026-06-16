"""
Unified Fliks API — semantic search + Indian cinema recommender.

Run:  python main.py
Port: 8000
"""

import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from typing import Dict

from indian_movies import get_survey_catalog, load_indian_movies

app = FastAPI(title="Fliks API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = Path("models")
EMBEDDING_DIM = 50

# --- Globals populated at startup ---
search_model = None
qdrant = None
indian_df = None
movie_dictionary: dict[int, str] = {}
movie_id_to_embedding_index: dict[int, int] = {}
embedding_index_to_movie_id: dict[int, int] = {}
global_movie_embeddings: nn.Embedding | None = None
survey_catalog: dict[int, str] = {}


class SurveyResponse(BaseModel):
    ratings: Dict[int, float]


def load_recommender_weights():
    global global_movie_embeddings, movie_id_to_embedding_index, embedding_index_to_movie_id, movie_dictionary

    weights_path = MODEL_DIR / "movie_embeddings.pt"
    map_path = MODEL_DIR / "movie_id_map.json"
    reverse_path = MODEL_DIR / "index_to_movie_id.json"
    titles_path = MODEL_DIR / "movie_titles.json"

    if not weights_path.exists():
        print("WARNING: No trained weights found. Run: python train_model.py")
        print("         Using random embeddings as fallback.")
        movie_ids = indian_df["id"].tolist()
        movie_id_to_embedding_index = {mid: i for i, mid in enumerate(movie_ids)}
        embedding_index_to_movie_id = {i: mid for mid, i in movie_id_to_embedding_index.items()}
        movie_dictionary = pd_series_to_dict(indian_df)
        global_movie_embeddings = nn.Embedding(len(movie_ids), EMBEDDING_DIM)
        global_movie_embeddings.weight.requires_grad = False
        return

    with open(map_path) as f:
        movie_id_to_embedding_index = {int(k): v for k, v in json.load(f).items()}
    with open(reverse_path) as f:
        embedding_index_to_movie_id = {int(k): int(v) for k, v in json.load(f).items()}
    with open(titles_path) as f:
        movie_dictionary = {int(k): v for k, v in json.load(f).items()}

    weights = torch.load(weights_path, weights_only=True)
    global_movie_embeddings = nn.Embedding.from_pretrained(weights, freeze=True)
    print(f"Loaded trained embeddings for {len(movie_id_to_embedding_index)} Indian movies.")


def pd_series_to_dict(df):
    return {int(row["id"]): str(row["title"]) for _, row in df.iterrows()}


@app.on_event("startup")
def startup():
    global search_model, qdrant, indian_df, survey_catalog

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Loading semantic search model on {device.upper()}...")
    search_model = SentenceTransformer("BAAI/bge-small-en-v1.5", device=device)

    print("Connecting to Qdrant (Indian cinema index)...")
    qdrant = QdrantClient(path="./qdrant_storage")

    print("Loading Indian movie catalog...")
    indian_df = load_indian_movies("movies_metadata.csv")
    survey_catalog = get_survey_catalog(indian_df)
    print(f"  {len(indian_df)} Indian films in catalog")

    load_recommender_weights()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "services": ["semantic-search", "recommender"],
        "indian_movies": len(indian_df) if indian_df is not None else 0,
        "trained_weights": (MODEL_DIR / "movie_embeddings.pt").exists(),
    }


@app.get("/search")
async def semantic_search(q: str, limit: int = 12):
    query_vector = search_model.encode(q).tolist()
    search_results = qdrant.query_points(
        collection_name="movies",
        query=query_vector,
        limit=limit,
    )
    return {
        "query": q,
        "results": [hit.payload for hit in search_results.points],
    }


@app.get("/survey-catalog")
async def get_survey_catalog_endpoint():
    return {
        "movies": [
            {"id": movie_id, "title": title}
            for movie_id, title in survey_catalog.items()
        ]
    }


@app.post("/onboard")
async def onboard_new_user(survey: SurveyResponse):
    rated_movie_ids = [
        movie_id
        for movie_id in survey.ratings.keys()
        if movie_id in movie_id_to_embedding_index
    ]
    if not rated_movie_ids:
        return {"message": "No rated movies matched the catalog.", "recommendations": []}

    movie_indices = torch.tensor(
        [movie_id_to_embedding_index[movie_id] for movie_id in rated_movie_ids],
        dtype=torch.long,
    )
    actual_ratings = torch.tensor(
        [survey.ratings[movie_id] for movie_id in rated_movie_ids],
        dtype=torch.float32,
    )

    new_user_vector = nn.Embedding(num_embeddings=1, embedding_dim=EMBEDDING_DIM)
    loss_fn = nn.MSELoss()
    optimizer = optim.Adam(new_user_vector.parameters(), lr=0.1)

    for _ in range(100):
        optimizer.zero_grad()
        frozen_movies = global_movie_embeddings(movie_indices)
        user_state = new_user_vector(torch.tensor([0]))
        predictions = (user_state * frozen_movies).sum(dim=1)
        loss = loss_fn(predictions, actual_ratings)
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        final_user_state = new_user_vector(torch.tensor([0]))
        all_movies = global_movie_embeddings.weight
        all_predictions = torch.matmul(all_movies, final_user_state.T).squeeze()

        # Exclude movies the user already rated
        rated_indices = set(movie_indices.tolist())
        for idx in rated_indices:
            all_predictions[idx] = float("-inf")

        top_k = min(5, all_predictions.shape[0])
        top_indices = torch.topk(all_predictions, top_k).indices.tolist()

    recommended_movies = [
        {
            "id": embedding_index_to_movie_id[idx],
            "title": movie_dictionary.get(
                embedding_index_to_movie_id[idx],
                f"Movie {embedding_index_to_movie_id[idx]}",
            ),
        }
        for idx in top_indices
        if idx in embedding_index_to_movie_id
    ]

    return {
        "message": "Taste profile mapped successfully.",
        "recommendations": recommended_movies,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
