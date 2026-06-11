"""
Train matrix-factorization embeddings and save weights for the recommender.

Usage:
  python train_model.py

Requires movies_metadata.csv and ratings_small.csv in this directory.
"""

import json
from pathlib import Path

import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from indian_movies import load_indian_movies

EMBEDDING_DIM = 50
EPOCHS = 30
LEARNING_RATE = 0.05
MODEL_DIR = Path("models")


class MatrixFactorization(nn.Module):
    def __init__(self, num_users: int, num_movies: int, embedding_dim: int):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.movie_embedding = nn.Embedding(num_movies, embedding_dim)

    def forward(self, user_idx, movie_idx):
        return (self.user_embedding(user_idx) * self.movie_embedding(movie_idx)).sum(dim=1)


def main():
    MODEL_DIR.mkdir(exist_ok=True)

    print("Loading metadata and ratings...")
    indian_df = load_indian_movies("movies_metadata.csv")
    indian_ids = set(indian_df["id"].tolist())

    ratings = pd.read_csv("ratings_small.csv")
    ratings = ratings[ratings["movieId"].isin(indian_ids)]

    if ratings.empty:
        raise RuntimeError("No ratings found for Indian movies. Check ratings_small.csv.")

    user_ids = sorted(ratings["userId"].unique())
    movie_ids = sorted(ratings["movieId"].unique())

    user_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
    movie_to_idx = {mid: idx for idx, mid in enumerate(movie_ids)}
    idx_to_movie = {idx: mid for mid, idx in movie_to_idx.items()}

    title_map = pd.Series(indian_df.title.values, index=indian_df.id).to_dict()

    users = torch.tensor([user_to_idx[u] for u in ratings["userId"]], dtype=torch.long)
    movies = torch.tensor([movie_to_idx[m] for m in ratings["movieId"]], dtype=torch.long)
    labels = torch.tensor(ratings["rating"].values, dtype=torch.float32)

    model = MatrixFactorization(len(user_ids), len(movie_ids), EMBEDDING_DIM)
    loss_fn = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    print(f"Training on {len(ratings)} Indian-movie ratings...")
    for epoch in range(EPOCHS):
        optimizer.zero_grad()
        preds = model(users, movies)
        loss = loss_fn(preds, labels)
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch + 1}/{EPOCHS} — MSE: {loss.item():.4f}")

    torch.save(model.movie_embedding.weight.detach(), MODEL_DIR / "movie_embeddings.pt")

    with open(MODEL_DIR / "movie_id_map.json", "w") as f:
        json.dump({str(k): v for k, v in movie_to_idx.items()}, f)

    with open(MODEL_DIR / "index_to_movie_id.json", "w") as f:
        json.dump({str(k): v for k, v in idx_to_movie.items()}, f)

    with open(MODEL_DIR / "movie_titles.json", "w") as f:
        json.dump({str(k): v for k, v in title_map.items()}, f)

    meta = {
        "embedding_dim": EMBEDDING_DIM,
        "num_movies": len(movie_ids),
        "num_users": len(user_ids),
        "indian_only": True,
    }
    with open(MODEL_DIR / "model_meta.json", "w") as f:
        json.dump(meta, f)

    print(f"Saved trained weights to {MODEL_DIR}/")


if __name__ == "__main__":
    main()
