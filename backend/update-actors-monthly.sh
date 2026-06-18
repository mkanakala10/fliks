#!/bin/bash
# Monthly Wikipedia Actors Update Script
# This script should be run once a month to refresh trending actor data
# Can be set up as a cron job: 0 0 1 * * /path/to/update-actors-monthly.sh

cd "$(dirname "$0")/.."

echo "🚀 Starting monthly actors update..."
echo "📅 Timestamp: $(date)"

# Activate virtual environment
source backend/venv/Scripts/activate

# Run the fetch script
python backend/fetch_wikipedia_actors.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Update completed successfully!"
    echo "📍 Updated file: public/data/trending-actors.json"
    
    # Optional: Commit to git if running in CI/CD
    if command -v git &> /dev/null; then
        git add public/data/trending-actors.json
        git commit -m "📊 Monthly actor pageviews update - $(date +%Y-%m-%d)" || true
    fi
else
    echo ""
    echo "❌ Update failed!"
    exit 1
fi
