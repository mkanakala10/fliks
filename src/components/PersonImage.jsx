import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { fetchWikipediaPortraits, portraitKey } from '../utils/wikipediaPortrait';

function Portrait({ src, name, loading = 'lazy', sx }) {
  const [failed, setFailed] = useState(() => new Set());
  const [fallbacks, setFallbacks] = useState([]);
  const [loaded, setLoaded] = useState(null);
  const needsFallback = !src || failed.has(portraitKey(src));

  useEffect(() => {
    if (!needsFallback) return;
    let cancelled = false;
    fetchWikipediaPortraits(name).then((sources) => {
      if (!cancelled) setFallbacks(sources);
    });
    return () => { cancelled = true; };
  }, [name, needsFallback]);

  const source = [src, ...fallbacks].find((candidate) => candidate && !failed.has(portraitKey(candidate)));
  const initials = name?.replace(/\s*\([^)]*\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('') || '?';

  return <Box component="span" sx={{ display: 'block', position: 'relative', overflow: 'hidden', bgcolor: 'background.paper', ...sx }}>
    {loaded !== source && <Box component="span" role="img" aria-label={`${name} photo unavailable`} sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'text.secondary', fontSize: 28 }}>{initials}</Box>}
    {source && <Box key={source} component="img" src={source} alt={name} loading={loading}
      onLoad={() => setLoaded(source)}
      onError={() => setFailed((previous) => new Set([...previous, portraitKey(source)]))}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', opacity: loaded === source ? 1 : 0, transition: 'opacity 160ms' }} />}
  </Box>;
}

export default function PersonImage(props) {
  // A new person/source must not inherit a previous portrait's failed URLs or async result.
  return <Portrait key={`${props.name}:${props.src || ''}`} {...props} />;
}
