import { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';

function ActorModal({ actorId, actorName, open, onClose, onMovieClick }) {
  const [details, setDetails] = useState(null);
  const [notableCredits, setNotableCredits] = useState([]);
  const [upcomingCredits, setUpcomingCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ((!actorId && !actorName) || !open) return;

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('TMDB API Key missing');
      return;
    }

    const fetchActorData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let realActorId = actorId;

        // If the actor ID is a Wikipedia hash (which are typically > 10,000,000) or missing,
        // perform a TMDB name-based person search lookup.
        if (actorName && (!realActorId || realActorId > 10000000)) {
          const searchRes = await fetch(
            `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`
          );
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const firstResult = searchData.results?.[0];
            if (firstResult) {
              realActorId = firstResult.id;
            } else {
              throw new Error(`Could not find actor "${actorName}" on TMDB`);
            }
          } else {
            throw new Error('Search failed');
          }
        }

        const [detailsRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/person/${realActorId}?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/person/${realActorId}/movie_credits?api_key=${apiKey}`),
        ]);

        if (!detailsRes.ok) throw new Error('Failed to load actor profile');

        const detailsData = await detailsRes.json();
        const creditsData = creditsRes.ok ? await creditsRes.json() : { cast: [] };

        const castCredits = creditsData.cast || [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Filter and sort unreleased / upcoming movies (TBA or release date > now)
        const upcoming = castCredits
          .filter((m) => {
            if (!m.poster_path) return false;
            if (!m.release_date || m.release_date === 'TBA') return true;
            try {
              return new Date(m.release_date) > now;
            } catch {
              return false;
            }
          })
          .sort((a, b) => {
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
          })
          .slice(0, 10);

        // Filter and sort released movies by popularity
        const notable = castCredits
          .filter((m) => {
            if (!m.poster_path) return false;
            if (!m.release_date || m.release_date === 'TBA') return false;
            try {
              return new Date(m.release_date) <= now;
            } catch {
              return true;
            }
          })
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 10);

        setDetails(detailsData);
        setNotableCredits(notable);
        setUpcomingCredits(upcoming);
      } catch (err) {
        setError(err.message || 'Error loading profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorData();
  }, [actorId, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="actor-profile-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box
        className="glass-panel"
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.2s',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error" variant="body1">
              {error}
            </Typography>
          </Box>
        ) : details ? (
          <Box sx={{ overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            {/* Header info */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }} sx={{ mb: 3 }}>
              <Box
                component="img"
                src={
                  details.profile_path
                    ? `https://image.tmdb.org/t/p/w185${details.profile_path}`
                    : 'https://via.placeholder.com/185x278?text=No+Photo'
                }
                alt={details.name}
                sx={{
                  width: { xs: 120, sm: 140 },
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  border: '3px solid rgba(99, 102, 241, 0.25)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
                }}
              />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                <Typography variant="h4" fontWeight={900} letterSpacing="-0.02em" sx={{ mb: 1 }}>
                  {details.name}
                </Typography>
                <Typography variant="subtitle2" color="secondary.main" fontWeight={700} sx={{ textTransform: 'uppercase', mb: 2 }}>
                  {details.known_for_department || 'Actor'}
                </Typography>

                <Stack spacing={1} sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                  {details.birthday && (
                    <Typography fontSize="inherit">
                      <strong>Born:</strong> {details.birthday}
                      {details.place_of_birth && ` in ${details.place_of_birth}`}
                    </Typography>
                  )}
                  {details.deathday && (
                    <Typography fontSize="inherit" color="error">
                      <strong>Died:</strong> {details.deathday}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Biography */}
            {details.biography ? (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
                  Biography
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                    maxHeight: { xs: 120, sm: 180 },
                    overflowY: 'auto',
                    pr: 1,
                    whiteSpace: 'pre-line',
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
                  }}
                >
                  {details.biography}
                </Typography>
              </Box>
            ) : null}

            {/* Upcoming Movies */}
            {upcomingCredits.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  Upcoming Projects
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {upcomingCredits.map((movie) => (
                    <Box
                      key={movie.id}
                      onClick={() => {
                        onMovieClick?.(movie.id);
                        onClose();
                      }}
                      sx={{
                        flex: '0 0 100px',
                        width: 100,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover img': { transform: 'scale(1.05)' },
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid rgba(245,158,11,0.2)',
                          mb: 0.75,
                        }}
                      >
                        <Box
                          component="img"
                          src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                          alt={movie.title}
                          sx={{
                            width: '100%',
                            aspectRatio: '2 / 3',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.25,
                          height: '2.5em',
                        }}
                      >
                        {movie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Notable Credits */}
            {notableCredits.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Notable Movies
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {notableCredits.map((movie) => (
                    <Box
                      key={movie.id}
                      onClick={() => {
                        onMovieClick?.(movie.id);
                        onClose();
                      }}
                      sx={{
                        flex: '0 0 100px',
                        width: 100,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover img': { transform: 'scale(1.05)' },
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.06)',
                          mb: 0.75,
                        }}
                      >
                        <Box
                          component="img"
                          src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                          alt={movie.title}
                          sx={{
                            width: '100%',
                            aspectRatio: '2 / 3',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.25,
                          height: '2.5em',
                        }}
                      >
                        {movie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : null}
      </Box>
    </Modal>
  );
}

export default ActorModal;
