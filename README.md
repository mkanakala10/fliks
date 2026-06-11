# Movie Meter

Indian cinema app — browse trending films, semantic search, personalized recommendations, and an AI assistant.

**Live site (after setup):** https://mkanakala10.github.io/movie-meter/

---

## Setup guide — follow in order

### Step 1 — Get your API keys

Do this first. Everything else depends on these.

| Priority | Key | Where to get it | Needed for |
|----------|-----|-----------------|------------|
| **Required** | TMDB API key | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) | Home, Trending, Actors, movie posters |
| **Required** | Firebase config (6 values) | [console.firebase.google.com](https://console.firebase.google.com) → create project → add web app → copy config | Google sign-in, star ratings |
| Optional | Gemini API key | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | AI Assistant chat |
| Optional | Backend URL | `http://localhost:8000` locally | Search, For You, chatbot grounding |

**Firebase extra step:** Authentication → Sign-in method → enable **Google**.

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

---

### Step 2 — Run the frontend locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you should see Home, Trending, and Actors if `VITE_TMDB_API_KEY` is set.

Test sign-in: click **Sign up with Google** (needs Firebase keys in `.env`).

---

### Step 3 — Run the backend locally (optional)

Skip this if you only need browse pages. Required for **Search**, **For You**, and **chatbot search grounding**.

```bash
cd backend

# Copy data files from your other projects (one time)
cp ~/Documents/movie-search/movies_metadata.csv .
cp ~/Documents/movie_recommender/ratings_small.csv .

python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python build_db.py              # once — builds search index (~few min)
python train_model.py           # once — trains recommender weights
python main.py                  # starts API on http://localhost:8000
```

Keep `VITE_API_URL=http://localhost:8000` in your `.env`. Restart `npm run dev` after changing `.env`.

---

### Step 4 — Deploy the frontend to GitHub Pages

1. **Push your code** to GitHub (`main` branch).

2. **Enable Pages**  
   Repo → **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**.

3. **Add GitHub secrets**  
   Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

   Add each secret (same values as your `.env`):

   | Secret name |
   |-------------|
   | `VITE_TMDB_API_KEY` |
   | `VITE_GEMINI_API_KEY` |
   | `VITE_API_URL` |
   | `VITE_FIREBASE_API_KEY` |
   | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `VITE_FIREBASE_PROJECT_ID` |
   | `VITE_FIREBASE_STORAGE_BUCKET` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `VITE_FIREBASE_APP_ID` |

   For `VITE_API_URL` on the live site: use your public backend URL (Step 5), or a placeholder until the backend is ready.

4. **Authorize Firebase for GitHub Pages**  
   Firebase Console → Authentication → Settings → **Authorized domains** → add:
   ```
   mkanakala10.github.io
   ```

5. **Deploy** — push to `main` (or re-run the **Deploy to GitHub Pages** workflow under Actions).  
   Site goes live at: **https://mkanakala10.github.io/movie-meter/**

**Test production build locally before pushing:**

```bash
VITE_BASE_PATH=/movie-meter/ npm run build
npx vite preview
```

---

### Step 5 — Backend for the live site (optional)

GitHub Pages only hosts the frontend. For Search / For You on the public URL:

**Option A — Demo from laptop**  
Run `python main.py` on your machine while presenting. Only works on your network unless you tunnel (e.g. ngrok).

**Option B — EC2 (public backend)**  
1. Launch a small EC2 instance (e.g. t3.micro).  
2. Security group: allow port **8000**.  
3. Copy `backend/` + CSV files to the instance.  
4. Run the same setup as Step 3, then:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
5. Update GitHub secret `VITE_API_URL` to `http://YOUR-EC2-PUBLIC-IP:8000`.  
6. Push to `main` (or re-run the deploy workflow) to rebuild the frontend.

See `backend/README.md` for API details.

---

## Quick reference

### What runs where

| Piece | Host | Free? |
|-------|------|-------|
| React frontend | GitHub Pages | Yes |
| Python API | Laptop or EC2 | EC2 free tier 12 mo |
| TMDB, Gemini, Firebase | External APIs | Free tiers |

### What each feature needs

| Feature | TMDB | Firebase | Gemini | Backend |
|---------|------|----------|--------|---------|
| Home / Trending / Actors / Details | ✅ | — | — | — |
| Google sign-in & star ratings | — | ✅ | — | — |
| Watch Later | — | — | — | — |
| Search / For You | — | — | — | ✅ |
| AI Assistant (full) | — | — | ✅ | ✅ |
| AI Assistant (search fallback) | — | — | — | ✅ |

### Environment files

| File | Purpose |
|------|---------|
| `.env` | Local development (`npm run dev`) |
| `.env.example` | Template for local `.env` |
| `.env.production.example` | Reference for GitHub Actions secrets |
| GitHub Actions secrets | Production build (never commit real keys) |

### AWS Amplify (alternative to Step 4)

If you prefer Amplify over GitHub Pages: connect the repo in [AWS Amplify](https://console.aws.amazon.com/amplify/), set the same `VITE_*` env vars, and add your Amplify domain to Firebase authorized domains. The repo includes `amplify.yml`.
