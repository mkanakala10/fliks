/**
 * Fetch trending Indian directors from Wikipedia pageviews data.
 * Data is generated via fetch_wikipedia_directors.py script.
 * 
 * @returns {Promise<Array>} Array of director objects with schema: {id, name, image, trendingScore}
 */
export async function fetchIndianDirectors() {
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}data/trending-directors.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending directors: ${response.status}`);
    }
    
    const directors = await response.json();
    
    // Validate data structure
    if (!Array.isArray(directors)) {
      throw new Error('Invalid directors data format');
    }
    
    // Filter out directors without images for UI consistency
    return directors.filter(director => director.image !== null && director.image !== undefined);
  } catch (error) {
    console.error('Error fetching trending directors:', error);
    // Return empty array on error - UI will handle gracefully
    return [];
  }
}
