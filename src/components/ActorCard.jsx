import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PersonImage from './PersonImage';

export default function ActorCard({ actor, rank, onClick }) {
  return (
    <Box component={onClick ? 'button' : 'div'} onClick={onClick} aria-label={onClick ? `View ${actor.name}` : undefined} sx={{ p: 0, width: '100%', bgcolor: 'transparent', color: 'text.primary', textAlign: 'left', border: 0, cursor: onClick ? 'pointer' : 'default', '&:hover img': { opacity: 0.85 } }}>
      <Box sx={{ aspectRatio: '4 / 5', bgcolor: 'background.paper', overflow: 'hidden', borderRadius: '6px', mb: 1.5 }}>
        <PersonImage src={actor.image} name={actor.name} sx={{ width: '100%', height: '100%' }} />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>{actor.name}</Typography>
      {rank && <Typography sx={{ color: 'text.secondary', fontSize: 10, mt: 0.4 }}>Popularity #{rank}</Typography>}
    </Box>
  );
}
