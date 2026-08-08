#!/usr/bin/env python3
"""
Fetch trending Indian directors from Wikipedia pageviews.
Queries Wikimedia Pageviews API for the last 30 days and Wikipedia API for director images.
Outputs JSON compatible with TMDB schema for seamless frontend integration.
"""

import json
import requests
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import time

# Configuration
DIRECTORS_FILE = Path(__file__).parent.parent / 'directors.txt'
OUTPUT_FILE = Path(__file__).parent.parent / 'public' / 'data' / 'trending-directors.json'

# API endpoints
WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
PAGEVIEWS_API = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents'

def get_director_names():
    """Read director names from directors.txt file."""
    try:
        with open(DIRECTORS_FILE, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"Error: directors.txt not found at {DIRECTORS_FILE}")
        sys.exit(1)

def get_pageviews(director_name, days=30):
    """
    Fetch pageviews for a director from Wikimedia Pageviews API.
    
    Args:
        director_name: Wikipedia article title (e.g., 'S._S._Rajamouli')
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
        
        url = f"{PAGEVIEWS_API}/{director_name}/daily/{start_str}/{end_str}"
        
        headers = {
            'User-Agent': 'MovieMeter/1.0 (https://github.com/arjun/movie-meter)'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        # Handle both 404 and other errors gracefully
        if response.status_code == 404:
            print(f"  ⚠️  Article not found for {director_name}")
            return 0
        
        response.raise_for_status()
        
        data = response.json()
        items = data.get('items', [])
        
        if not items:
            return 0
            
        total_views = sum(item.get('views', 0) for item in items)
        return total_views
    
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  API error for {director_name}: {str(e)[:50]}")
        return 0

def get_director_image(director_name):
    """
    Fetch Wikipedia thumbnail image for a director.
    
    Args:
        director_name: Wikipedia article title (e.g., 'S._S._Rajamouli')
    
    Returns:
        URL to thumbnail image, or None if not found
    """
    try:
        params = {
            'action': 'query',
            'titles': director_name,
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
        print(f"  ⚠️  Image fetch error for {director_name}: {str(e)[:50]}")
        return None

def format_director_name(wiki_title):
    """Convert Wikipedia title to readable director name (replace underscores with spaces)."""
    return wiki_title.replace('_', ' ')

def fetch_trending_directors():
    """
    Main function to fetch all directors and their pageviews.
    Returns list sorted by pageviews (highest first).
    Assigns scores based on popularity if pageviews data is unavailable.
    """
    print("📺 Fetching Wikipedia data for Indian directors...")
    
    director_names = get_director_names()
    print(f"📋 Found {len(director_names)} directors to fetch")
    print()
    
    directors_data = []
    
    for idx, director_name in enumerate(director_names, 1):
        # Calculate a base score (inverse of position) for fallback
        base_score = max(100, (len(director_names) - idx) * 100)
        
        print(f"[{idx:3d}/{len(director_names)}] {director_name:30s}", end=' ', flush=True)
        
        # Fetch pageviews
        pageviews = get_pageviews(director_name)
        
        # Use pageviews if available, otherwise use base score
        score = pageviews if pageviews > 0 else base_score
        
        # Fetch image
        image_url = get_director_image(director_name)
        
        # Create director object matching TMDB schema
        director = {
            'id': hash(director_name) & 0x7FFFFFFF,  # Positive integer ID based on name
            'name': format_director_name(director_name),
            'image': image_url,
            'trendingScore': int(score)
        }
        
        directors_data.append(director)
        
        if pageviews > 0:
            print(f"✓ ({pageviews:,} views)")
        else:
            print(f"✓ (base score)")
        
        # Be nice to the APIs - add small delay between requests
        time.sleep(0.2)
    
    # Sort by trendingScore in descending order
    directors_data.sort(key=lambda x: x['trendingScore'], reverse=True)
    
    return directors_data

def save_to_json(directors_data):
    """Save director data to JSON file."""
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(directors_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Data saved to {OUTPUT_FILE}")
    print(f"📊 Total directors: {len(directors_data)}")
    if directors_data:
        print(f"🏆 Top director: {directors_data[0]['name']} (Score: {directors_data[0]['trendingScore']})")
        print(f"📸 Images: {sum(1 for a in directors_data if a['image'])} with images")

if __name__ == '__main__':
    try:
        print("="*70)
        print("Wikipedia Pageviews to JSON Converter (Directors)")
        print("="*70)
        print()
        
        directors = fetch_trending_directors()
        save_to_json(directors)
        
        print("\n" + "="*70)
        print("✨ Process completed successfully!")
        print("="*70)
    
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
