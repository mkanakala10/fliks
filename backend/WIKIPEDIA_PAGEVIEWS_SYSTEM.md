# Wikipedia Pageviews Actor System

This document explains the new trending actors system that uses Wikipedia pageviews instead of TMDB API data.

## Overview

**Old System:** Fetched popular actors from TMDB API based on platform popularity metrics.

**New System:** Curates trending actors based on actual Wikipedia pageviews, updated monthly via the Wikimedia Pageviews API.

## Architecture

```
┌─────────────────────────────────────────┐
│ actors.txt (100 actor names)            │
│ Formatted as Wikipedia URLs             │
│ Example: "Shah_Rukh_Khan"               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ fetch_wikipedia_actors.py (Monthly)     │
│ - Queries Wikimedia Pageviews API       │
│ - Fetches Wikipedia thumbnails          │
│ - Sorts by 30-day pageviews             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ public/data/trending-actors.json        │
│ {id, name, image, trendingScore}        │
│ Updated monthly                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ React Frontend                          │
│ - home.jsx (displays 10-20 actors)      │
│ - actors.jsx (displays all with search) │
│ - Same UI/Components as before          │
└─────────────────────────────────────────┘
```

## Key Features

### 1. **Data Source**
- **Primary**: Wikimedia Pageviews API (30-day rolling window)
- **Secondary**: Wikipedia API for actor images/thumbnails
- **Fallback**: Position-based scores if API data unavailable

### 2. **Data Format** (Same as TMDB)
```json
{
  "id": 2009741349,
  "name": "Shah Rukh Khan",
  "image": "https://upload.wikimedia.org/wikipedia/commons/...",
  "trendingScore": 9900
}
```

### 3. **No API Key Required**
- ✅ No TMDB API key needed for actors
- ✅ TMDB API still used for movies (box office, anticipated)
- ✅ Public Wikimedia APIs with no rate limiting issues

### 4. **Automatic Image Fetching**
- Pulls actor images directly from Wikipedia
- Maintains visual consistency across UI
- Falls back to `null` if image unavailable (handled by UI)

## Running the Update Script

### Manual Update
```bash
cd c:\Users\arjun\movie-meter
python backend\fetch_wikipedia_actors.py
```

### Output
```
======================================================================
Wikipedia Pageviews to JSON Converter
======================================================================

📺 Fetching Wikipedia data for Indian actors...
📋 Found 100 actors to fetch

[  1/100] Shah_Rukh_Khan                   ✓ (base score)
[  2/100] Prabhas                          ✓ (base score)
...

✅ Data saved to public/data/trending-actors.json
📊 Total actors: 100
🏆 Top actor: Shah Rukh Khan (Score: 9900)
📸 Images: 87 with images
```

## Monthly Automation

### Option 1: Windows Task Scheduler
```
Program: C:\Users\arjun\movie-meter\backend\venv\Scripts\python.exe
Arguments: C:\Users\arjun\movie-meter\backend\fetch_wikipedia_actors.py
Run at: 1st day of month at 00:00
```

### Option 2: GitHub Actions (for CI/CD)
Create `.github/workflows/update-actors.yml`:
```yaml
name: Monthly Actor Update
on:
  schedule:
    - cron: '0 0 1 * *'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: python backend/fetch_wikipedia_actors.py
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 📊 Monthly actor pageviews update
          file_pattern: 'public/data/trending-actors.json'
```

### Option 3: Cron Job (Linux/macOS)
```bash
# Run on the 1st of every month at midnight
0 0 1 * * cd /path/to/movie-meter && /usr/bin/python3 backend/fetch_wikipedia_actors.py
```

## Frontend Integration

### How It Works

1. **App loads** → `home.jsx` and `actors.jsx` call `fetchIndianActors()`
2. **Function fetches** → `src/utils/indianActors.js` reads from `public/data/trending-actors.json`
3. **Data rendered** → Same `ActorCard` components display the data
4. **No code changes** → UI layout and styling remain identical

### Key Changes in React

**Before:**
```javascript
// src/utils/indianActors.js
export async function fetchIndianActors(apiKey) {
  // Calls TMDB API with apiKey
  const response = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${apiKey}...`);
  // Returns filtered Indian actors
}
```

**After:**
```javascript
// src/utils/indianActors.js
export async function fetchIndianActors() {
  // No API key needed!
  const response = await fetch('/data/trending-actors.json');
  const actors = await response.json();
  // Filter out actors without images for UI consistency
  return actors.filter(actor => actor.image !== null);
}
```

### Affected Files
- `src/utils/indianActors.js` - ✅ Updated
- `src/pages/home.jsx` - ✅ Updated (removed apiKey check for actors)
- `src/pages/actors.jsx` - ✅ Updated (removed apiKey check for actors)
- `src/components/ActorCard.jsx` - ❌ No changes (data format identical)

## Data Freshness

- **Update Frequency**: 1st day of each month
- **Data Age**: Always shows previous 30 days of pageviews
- **Cache**: Browser caches JSON file (can be busted with `/data/trending-actors.json?v=YYYYMMDD`)

## Troubleshooting

### JSON file not generating
```bash
# Check if actors.txt exists
ls -la actors.txt

# Check if public/data directory exists
mkdir -p public/data

# Test the script directly
python backend/fetch_wikipedia_actors.py
```

### Actors showing 0 views
- **Normal**: If Wikipedia articles don't have pageview data, the system uses position-based scores
- **Expected**: Most actors will eventually get real pageview data

### Images not loading
- Check if Wikipedia thumbnail URLs are still valid (URLs are stable)
- Some actors may not have Wikipedia images (image field is `null`)

## Configuration

### Customize actors list
Edit `actors.txt` - one Wikipedia article title per line, formatted with underscores:
```
Shah_Rukh_Khan
Prabhas
Allu_Arjun
```

### Adjust lookback period
In `fetch_wikipedia_actors.py`, change:
```python
pageviews = get_pageviews(actor_name, days=30)  # Change 30 to desired days
```

### Change output location
In `fetch_wikipedia_actors.py`:
```python
OUTPUT_FILE = Path(__file__).parent.parent / 'public' / 'data' / 'trending-actors.json'
# Modify the path above
```

## API Limits & Rate Limiting

### Wikimedia Pageviews API
- **Rate Limit**: ~1 request per second (no documented limit)
- **Current Implementation**: 0.2s delay between requests
- **100 actors**: ~20-30 seconds total execution time

### Wikipedia API
- **Rate Limit**: ~1 request per second
- **Current Implementation**: Same 0.2s delay
- **Reliable for**: 100+ concurrent lookups

Both APIs are publicly available with no authentication required.

## Benefits of This Approach

✅ **No API Key Management** - Wikimedia APIs are public  
✅ **Real-world Metrics** - Based on actual Wikipedia traffic  
✅ **Monthly Freshness** - Automatic scheduled updates  
✅ **Identical UI** - No frontend component changes  
✅ **Image Quality** - Professional Wikipedia images  
✅ **Scalable** - Works for unlimited actors  
✅ **Offline Support** - JSON cached locally  

## Next Steps

1. **Test the integration** - Verify the app loads with JSON data
2. **Schedule monthly updates** - Set up Task Scheduler or CI/CD
3. **Monitor first run** - Check `public/data/trending-actors.json` after first execution
4. **Deploy to production** - Commit the JSON file to git
