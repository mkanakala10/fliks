/**
 * Fetch trending Indian actors from Wikipedia pageviews data.
 * Data is generated monthly via fetch_wikipedia_actors.py script.
 * 
 * @returns {Promise<Array>} Array of actor objects with schema: {id, name, image, trendingScore}
 */
export async function fetchIndianActors() {
  try {
    const response = await fetch('/data/trending-actors.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending actors: ${response.status}`);
    }
    
    const actors = await response.json();
    
    // Validate data structure
    if (!Array.isArray(actors)) {
      throw new Error('Invalid actors data format');
    }
    
    // Filter out actors without images for UI consistency
    return actors.filter(actor => actor.image !== null && actor.image !== undefined);
  } catch (error) {
    console.error('Error fetching trending actors:', error);
    // Return empty array on error - UI will handle gracefully
    return [];
  }
}
