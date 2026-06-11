#!/usr/bin/env bash
# Run the unified API on EC2 or any Linux server.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

if [ ! -d "qdrant_storage" ]; then
  echo "Missing qdrant_storage/. Run: python build_db.py"
  exit 1
fi

if [ ! -f "models/movie_embeddings.pt" ]; then
  echo "Missing trained weights. Run: python train_model.py"
  exit 1
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000
