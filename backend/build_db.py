"""
Build the Qdrant vector index for Indian cinema semantic search.

Usage:
  python build_db.py

Requires movies_metadata.csv in this directory.
"""

import uuid

import torch
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

from indian_movies import load_indian_movies

print("1. Loading Indian movies from metadata...")
indian_df = load_indian_movies("movies_metadata.csv")
movies = indian_df.to_dict("records")
print(f"   {len(movies)} Indian films to index")

print("2. Initializing model and Qdrant...")
device = "mps" if torch.backends.mps.is_available() else "cpu"
model = SentenceTransformer("BAAI/bge-small-en-v1.5", device=device)
vector_size = model.get_embedding_dimension()

qdrant = QdrantClient(path="./qdrant_storage")
qdrant.recreate_collection(
    collection_name="movies",
    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
)

print("3. Embedding and upserting...")
batch_size = 256
for i in tqdm(range(0, len(movies), batch_size), desc="Batches"):
    batch = movies[i : i + batch_size]
    plots = [str(movie["overview"]) for movie in batch]
    embeddings = model.encode(plots, batch_size=64).tolist()

    points = []
    for j, movie in enumerate(batch):
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embeddings[j],
                payload={
                    "csv_id": str(int(movie["id"])),
                    "title": str(movie["title"]),
                    "plot": str(movie["overview"]),
                    "language": str(movie.get("original_language", "")),
                },
            )
        )

    qdrant.upsert(collection_name="movies", points=points)

print("Done! Indian cinema vector DB saved to ./qdrant_storage")
