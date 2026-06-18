#!/usr/bin/env python3
"""
Fetch trending Indian actors from Wikipedia pageviews.
Queries Wikimedia Pageviews API for the last 30 days and Wikipedia API for actor images.
Outputs JSON compatible with TMDB schema for seamless frontend integration.
"""

import json
import requests
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import time

# Configuration
ACTORS_FILE = Path(__file__).parent.parent / 'actors.txt'
OUTPUT_FILE = Path(__file__).parent.parent / 'public' / 'data' / 'trending-actors.json'

# API endpoints
WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
PAGEVIEWS_API = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/daily'

def get_actor_names():
    """Read actor names from actors.txt file."""
    try:
        with open(ACTORS_FILE, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"Error: actors.txt not found at {ACTORS_FILE}")
        sys.exit(1)

def get_pageviews(actor_name, days=30):
    """
    Fetch pageviews for an actor from Wikimedia Pageviews API.
    
    Args:
        actor_name: Wikipedia article title (e.g., 'Shah_Rukh_Khan')
        days: Number of days to look back (default 30)
    
    Returns:
        Total pageviews for the period, or 0 if not found
    """
    try:
        # Use timezone-aware UTC now
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=days)
        
        # Format dates as YYYYMMDD for API
        start_str = start_date.strftime('%Y%m%d')
        end_str = end_date.strftime('%Y%m%d')
        
        url = f"{PAGEVIEWS_API}/{actor_name}/{start_str}/{end_str}"
        
        headers = {
            'User-Agent': 'MovieMeter/1.0 (https://github.com/arjun/movie-meter)'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        # Handle both 404 and other errors gracefully
        if response.status_code == 404:
            print(f"  ⚠️  Article not found for {actor_name}")
            return 0
        
        response.raise_for_status()
        
        data = response.json()
        items = data.get('items', [])
        
        if not items:
            return 0
            
        total_views = sum(item.get('views', 0) for item in items)
        return total_views
    
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  API error for {actor_name}: {str(e)[:50]}")
        return 0

def get_actor_image(actor_name):
    """
    Fetch Wikipedia thumbnail image for an actor.
    
    Args:
        actor_name: Wikipedia article title (e.g., 'Shah_Rukh_Khan')
    
    Returns:
        URL to thumbnail image, or None if not found
    """
    try:
        params = {
            'action': 'query',
            'titles': actor_name,
            'prop': 'pageimages',
            'pithumbsize': 500,  # Request 500px thumbnail
            'format': 'json'
        }
        
        headers = {
            'User-Agent': 'MovieMeter/1.0 (https://github.com/arjun/movie-meter)'
        }
        
        response = requests.get(WIKIPEDIA_API, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        pages = data.get('query', {}).get('pages', {})
        
        for page in pages.values():
            if 'thumbnail' in page:
                return page['thumbnail']['source']
        
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  Image fetch error for {actor_name}: {str(e)[:50]}")
        return None

def format_actor_name(wiki_title):
    """Convert Wikipedia title to readable actor name (replace underscores with spaces)."""
    return wiki_title.replace('_', ' ')

def fetch_trending_actors():
    """
    Main function to fetch all actors and their pageviews.
    Returns list sorted by pageviews (highest first).
    Assigns scores based on popularity if pageviews data is unavailable.
    """
    print("📺 Fetching Wikipedia data for Indian actors...")
    
    actor_names = get_actor_names()
    print(f"📋 Found {len(actor_names)} actors to fetch")
    print()
    
    actors_data = []
    
    for idx, actor_name in enumerate(actor_names, 1):
        # Calculate a base score (inverse of position) for fallback
        # This ensures first actors have higher scores if API data is unavailable
        base_score = max(100, (len(actor_names) - idx) * 100)
        
        print(f"[{idx:3d}/{len(actor_names)}] {actor_name:30s}", end=' ', flush=True)
        
        # Fetch pageviews
        pageviews = get_pageviews(actor_name)
        
        # Use pageviews if available, otherwise use base score
        score = pageviews if pageviews > 0 else base_score
        
        # Fetch image
        image_url = get_actor_image(actor_name)
        
        # Create actor object matching TMDB schema
        actor = {
            'id': hash(actor_name) & 0x7FFFFFFF,  # Positive integer ID based on name
            'name': format_actor_name(actor_name),
            'image': image_url,
            'trendingScore': int(score)
        }
        
        actors_data.append(actor)
        
        if pageviews > 0:
            print(f"✓ ({pageviews:,} views)")
        else:
            print(f"✓ (base score)")
        
        # Be nice to the APIs - add small delay between requests
        time.sleep(0.2)
    
    # Sort by trendingScore in descending order
    actors_data.sort(key=lambda x: x['trendingScore'], reverse=True)
    
    return actors_data

def save_to_json(actors_data):
    """Save actor data to JSON file."""
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(actors_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Data saved to {OUTPUT_FILE}")
    print(f"📊 Total actors: {len(actors_data)}")
    if actors_data:
        print(f"🏆 Top actor: {actors_data[0]['name']} (Score: {actors_data[0]['trendingScore']})")
        print(f"📸 Images: {sum(1 for a in actors_data if a['image'])} with images")

if __name__ == '__main__':
    try:
        print("="*70)
        print("Wikipedia Pageviews to JSON Converter")
        print("="*70)
        print()
        
        actors = fetch_trending_actors()
        save_to_json(actors)
        
        print("\n" + "="*70)
        print("✨ Process completed successfully!")
        print("="*70)
    
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

