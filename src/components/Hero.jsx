import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Hero({ onNavigate, onViewMovie, featuredMovies = [], loading = false }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const movies = featuredMovies.slice(0, 5);
  const movie = movies[activeSlide] || movies[0];
  return (
    <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 5 }, pb: { xs: 1, md: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3.5 }}>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.2 }}>The Indian cinema guide</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 28, sm: 34, md: 38 }, lineHeight: 1.18, letterSpacing: '-0.045em', fontWeight: 500 }}>Good films. A closer look.</Typography>
        </Box>
        <Button onClick={() => onNavigate?.('all-movies')} endIcon={<ArrowUpRight size={16} />} sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary', fontSize: 12, px: 0 }}>Explore all movies</Button>
      </Stack>
      <Box component="section" aria-label="Featured films" aria-busy={loading} sx={{ position: 'relative', bgcolor: '#22251f', color: '#f5f3eb', borderRadius: '8px', overflow: 'hidden', minHeight: { xs: 470, sm: 400, md: 420 } }}>
        {loading && !movie ? (
          <Stack role="status" aria-label="Loading featured films" justifyContent="flex-end" spacing={2} sx={{ minHeight: 'inherit', p: { xs: 3, md: 5 }, width: { xs: '100%', sm: '60%' } }}>
            <Skeleton width={110} height={14} sx={{ bgcolor: '#ffffff12' }} />
            <Skeleton width="80%" height={64} sx={{ bgcolor: '#ffffff12' }} />
            <Skeleton width="45%" height={18} sx={{ bgcolor: '#ffffff12' }} />
            <Skeleton width="90%" height={40} sx={{ bgcolor: '#ffffff12' }} />
            <Skeleton variant="rounded" width={150} height={40} sx={{ bgcolor: '#ffffff12' }} />
          </Stack>
        ) : <>
        {movie && <Box component="img" src={movie.backdropPath || movie.image} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: { xs: '65% center', md: 'center 35%' }, opacity: 0.85 }} />}
        <Box sx={{ position: 'absolute', inset: 0, background: { xs: 'linear-gradient(0deg, #141713 5%, #141713d9 45%, #14171320 100%)', sm: 'linear-gradient(90deg, #141713 0%, #141713ee 25%, #14171388 52%, #1417130d 100%)' } }} />
        <Stack justifyContent="flex-end" sx={{ position: 'relative', minHeight: 'inherit', p: { xs: 3, md: 5 }, width: { xs: '100%', sm: '67%', md: '57%' }, pb: { xs: 9, sm: 5 } }}>
          <Typography sx={{ color: '#e9a06e', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', mb: 2 }}>{movie ? 'In the spotlight' : 'Discover your next great film'}</Typography>
          <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: 36, md: 52 }, lineHeight: 1.08, letterSpacing: '-0.025em', mb: 2 }}>{movie?.title || 'A world of cinema.\nCloser to home.'}</Typography>
          {movie && <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: '#c0c5b9', fontSize: 12, mb: 1.5 }}>
            {movie.rating > 0 && <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, color: '#ece7d9' }}><Star size={12} fill="#e9a06e" color="#e9a06e" />{Number(movie.rating).toFixed(1)}<Box component="span" sx={{ color: '#adb2a5', fontSize: 10 }}>TMDB</Box></Box>}
            {movie.releaseDate && <span>{movie.releaseDate.slice(0, 4)}</span>}
            <span>{movie.genre}</span>
          </Stack>}
          <Typography sx={{ color: '#c0c5b9', fontSize: 13, lineHeight: 1.75, maxWidth: 390, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 3 }}>{movie?.overview || 'Explore new releases, follow the box office, and keep the films you want to see in one place.'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" onClick={() => movie ? onViewMovie?.(movie.id) : onNavigate?.('all-movies')} endIcon={<ArrowRight size={15} />} sx={{ bgcolor: '#eeeae0', color: '#20241c', fontSize: 12, '&:hover': { bgcolor: '#fffdf5' } }}>{movie ? 'Explore film' : 'Browse movies'}</Button>
            <Button onClick={() => onNavigate?.('trending')} sx={{ color: '#eeeae0', fontSize: 12 }}>See what’s trending</Button>
          </Stack>
        </Stack>
        {movies.length > 1 && <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'absolute', right: { xs: 24, md: 32 }, bottom: { xs: 18, md: 28 } }}>
          <Typography sx={{ fontSize: 11, color: '#eeeae0', fontVariantNumeric: 'tabular-nums', mr: 1 }}>{String(activeSlide + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}</Typography>
          <IconButton aria-label="Previous featured film" onClick={() => setActiveSlide((activeSlide - 1 + movies.length) % movies.length)} sx={{ color: '#eeeae0', bgcolor: '#141713aa', border: '1px solid #ffffff40', width: 32, height: 32 }}><ChevronLeft size={16} /></IconButton>
          <IconButton aria-label="Next featured film" onClick={() => setActiveSlide((activeSlide + 1) % movies.length)} sx={{ color: '#eeeae0', bgcolor: '#141713aa', border: '1px solid #ffffff40', width: 32, height: 32 }}><ChevronRight size={16} /></IconButton>
        </Stack>}
        </>}
      </Box>
    </Container>
  );
}
