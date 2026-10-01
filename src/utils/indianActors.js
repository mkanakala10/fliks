const WIKIPEDIA_PERSON_QUALIFIER = /\s+\((?:actor|actress|film actor|television actor)\)\s*$/i;

/** Remove Wikipedia-only disambiguators before showing or searching a person's name. */
export function normalizeActorName(name = '') {
  return String(name).replaceAll('_', ' ').replace(WIKIPEDIA_PERSON_QUALIFIER, '').trim();
}

/**
 * Fetch trending Indian actors from Wikipedia pageviews data.
 * Data is generated weekly via fetch_wikipedia_actors.py (GitHub Actions every Monday).
 * 
 * @returns {Promise<Array>} Array of actor objects with schema: {id, name, image, trendingScore}
 */
export async function fetchIndianActors({ throwOnError = false } = {}) {
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}data/trending-actors.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending actors: ${response.status}`);
    }
    
    const actors = await response.json();
    
    // Validate data structure
    if (!Array.isArray(actors)) {
      throw new Error('Invalid actors data format');
    }
    
    return actors.map((actor) => ({
      ...actor,
      name: normalizeActorName(actor.name),
      department: 'Acting',
    }));
  } catch (error) {
    console.error('Error fetching trending actors:', error);
    if (throwOnError) throw error;
    // Return empty array on error - UI will handle gracefully
    return [];
  }
}

/**
 * Fetch the weekly history of top-10 actor trending scores.
 * Data is appended each week by fetch_wikipedia_actors.py.
 *
 * @returns {Promise<Array>} Array of { week: string, actors: [{name, trendingScore, rank}] }
 */
export async function fetchActorHistory() {
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}data/trending-actors-history.json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch actor history: ${response.status}`);
    }

    const history = await response.json();

    if (!Array.isArray(history)) {
      throw new Error('Invalid actor history format');
    }

    // Sort chronologically (oldest first) so the chart reads left-to-right
    return history
      .map((entry) => ({
        ...entry,
        actors: Array.isArray(entry.actors)
          ? entry.actors.map((actor) => ({ ...actor, name: normalizeActorName(actor.name) }))
          : [],
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  } catch (error) {
    console.error('Error fetching actor history:', error);
    return [];
  }
}
