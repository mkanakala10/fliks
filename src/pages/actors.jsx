import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { Search, X } from 'lucide-react';
import PageShell from '../components/PageShell';
import ActorCard from '../components/ActorCard';
import Button from '../components/Button';
import { fetchIndianActors, fetchActorHistory } from '../utils/indianActors';
import ActorModal from '../components/ActorModal';
import ActorTrendChart from '../components/ActorTrendChart';

const PAGE_SIZE = 24;
const gridStyles = { display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' }, columnGap: { xs: 2, md: 3 }, rowGap: 4 };

function Actors({ onViewMovie }) {
  const [actors, setActors] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('trending');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorHistory, setActorHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [indianActors, history] = await Promise.all([
          fetchIndianActors({ throwOnError: true }), fetchActorHistory(),
        ]);
        if (!cancelled) { setActors(indianActors); setActorHistory(history); }
      } catch {
        if (!cancelled) setError('We couldn’t load the actors. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [attempt]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = actors.map((actor, index) => ({ ...actor, rank: index + 1 }))
      .filter((actor) => actor.name.toLocaleLowerCase().includes(query));
    return sort === 'name' ? matches.sort((a, b) => a.name.localeCompare(b.name)) : matches;
  }, [actors, search, sort]);

  const changeSearch = (value) => { setSearch(value); setVisibleCount(PAGE_SIZE); };

  return <PageShell>
    <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 10 } }}>
      <Box component="section" sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 4, md: 5 } }}>
        <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'primary.main', mb: 1.5 }}>THE PEOPLE BEHIND THE PICTURE</Typography>
        <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: { xs: 40, md: 58 }, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 2 }}>Indian actors</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>Explore the faces and performances that shape Indian cinema.</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ py: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <TextField value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Search by name" size="small" disabled={isLoading || !!error}
          inputProps={{ 'aria-label': 'Search actors' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={17} /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => changeSearch('')}><X size={16} /></IconButton></InputAdornment> : null }}
          sx={{ width: { xs: '100%', sm: 340 }, '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: 'background.paper', fontSize: 13 } }} />
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
        <TextField select label="Sort by" value={sort} onChange={(event) => { setSort(event.target.value); setVisibleCount(PAGE_SIZE); }} size="small" disabled={isLoading || !!error} sx={{ width: { xs: '100%', sm: 185 }, '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 13 } }}>
          <MenuItem value="trending">Most popular</MenuItem><MenuItem value="name">Name A–Z</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? <Box role="status" aria-label="Loading actors" sx={gridStyles}>
        {Array.from({ length: 12 }, (_, index) => <Box key={index}><Skeleton variant="rounded" sx={{ aspectRatio: '4 / 5', height: 'auto', borderRadius: '6px', mb: 1.5 }} /><Skeleton width="65%" /><Skeleton width="40%" /></Box>)}
      </Box> : error ? <Box role="alert" sx={{ py: 7, textAlign: 'center' }}>
        <Typography sx={{ mb: 2, color: 'text.secondary' }}>{error}</Typography><Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
      </Box> : <>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
          <Typography role="status" sx={{ fontSize: 12, color: 'text.secondary' }}>{filtered.length} {filtered.length === 1 ? 'actor' : 'actors'}{search.trim() ? ` matching “${search.trim()}”` : ' to discover'}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Popularity based on Wikipedia page views</Typography>
        </Stack>
        {filtered.length ? <>
          <Box component="section" aria-label="Actor directory" sx={gridStyles}>
            {filtered.slice(0, visibleCount).map((actor) => <ActorCard key={actor.id} actor={actor} rank={actor.rank} onClick={() => setSelectedActor(actor)} />)}
          </Box>
          {filtered.length > visibleCount && <Stack alignItems="center" spacing={1.5} sx={{ mt: 5 }}>
            <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Show more actors</Button>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Showing {visibleCount} of {filtered.length}</Typography>
          </Stack>}
        </> : <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography component="h2" sx={{ fontSize: 22, fontWeight: 500, mb: 1 }}>No actors found</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13, mb: 2 }}>{search.trim() ? 'Try another name or clear your search to browse everyone.' : 'New profiles will appear here when they’re available.'}</Typography>
          {search.trim() && <Button variant="secondary" onClick={() => changeSearch('')}>Browse all actors</Button>}
        </Box>}
        {!search.trim() && actors.length > 0 && <Box component="section" aria-label="Actor popularity trends" sx={{ mt: { xs: 6, md: 8 } }}><ActorTrendChart history={actorHistory} /></Box>}
      </>}
    </Container>
    <ActorModal actorId={selectedActor?.id} actorName={selectedActor?.name} department="Acting" open={!!selectedActor} onClose={() => setSelectedActor(null)} onMovieClick={onViewMovie} />
  </PageShell>;
}

export default Actors;
