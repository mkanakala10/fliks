# Fliks Unified Backend

Single FastAPI service for **Indian cinema** semantic search and personalized recommendations.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service status |
| `/search?q=...&limit=12` | GET | Semantic search (Qdrant + BGE embeddings) |
| `/survey-catalog` | GET | 5 Indian seed films for taste survey |
| `/onboard` | POST | `{ "ratings": { "20453": 5, "19404": 3 } }` → top 5 recommendations |

**Port:** `8000` — run with `python main.py`

## Setup

### 1. Copy data files into `backend/`

```bash
cp ../movie-search/movies_metadata.csv .
cp ../movie_recommender/ratings_small.csv .
```

### 2. Install dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Build the Indian cinema search index (one-time)

```bash
python build_db.py
```

Indexes only Indian films (Hindi, Tamil, Telugu, Malayalam, Kannada, etc.).

### 4. Train recommender weights (one-time)

```bash
python train_model.py
```

Trains matrix factorization on Indian-movie ratings and saves weights to `models/`.

### 5. Start the server

```bash
python main.py
```

## Frontend config

In the project root `.env`:

```bash
VITE_API_URL=http://localhost:8000
VITE_TMDB_API_KEY=your_key
VITE_GEMINI_API_KEY=your_key
```

## Architecture

- **Semantic search** — `BAAI/bge-small-en-v1.5` embeddings stored in Qdrant (`qdrant_storage/`)
- **Recommender** — PyTorch matrix factorization; frozen movie embeddings + per-user micro-tuning on survey ratings
- **Indian filter** — `indian_movies.py` filters by `original_language` and `production_countries`
