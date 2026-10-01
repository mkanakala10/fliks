import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
const LINE_COLORS = ['#bd825b', '#8c80ab', '#558b9c', '#7f985e', '#b86676', '#b09a45', '#698abe', '#ac7c99', '#55998c', '#967d65'];
const formatWeek = (week) => new Date(`${week}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const shortNumber = (value) => Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

function ActorTrendChart({ history = [] }) {
  const theme = useTheme();
  const [metric, setMetric] = useState('views');
  const [selection, setSelection] = useState(null);
  const weeks = useMemo(() => {
    // A repeated weekly snapshot replaces its earlier version, and dates always run left to right.
    const unique = new Map();
    history.forEach((entry) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(entry.week) && Array.isArray(entry.actors)) unique.set(entry.week, entry);
    });
    return [...unique.values()].sort((a, b) => a.week.localeCompare(b.week));
  }, [history]);
  const latest = weeks.at(-1);
  const names = useMemo(() => [...(latest?.actors || [])]
    .filter((actor) => actor.name && Number.isFinite(actor.rank) && actor.rank > 0)
    .sort((a, b) => a.rank - b.rank).slice(0, 10).map((actor) => actor.name), [latest]);
  const selected = selection || names.slice(0, 5);
  const visibleNames = names.filter((name) => selected.includes(name));
  const toggleActor = (name) => setSelection(selected.includes(name) ? selected.filter((value) => value !== name) : [...selected, name]);
  const valueFor = (entry, name) => {
    const actor = entry.actors.find((candidate) => candidate.name === name);
    const value = metric === 'rank' ? actor?.rank : actor?.trendingScore;
    return Number.isFinite(value) && value >= (metric === 'rank' ? 1 : 0) ? value : null;
  };

  if (!names.length) return <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: '6px', color: 'text.secondary' }}>
    <Typography sx={{ fontSize: 13 }}>Popularity trends will appear as more weekly data becomes available.</Typography>
  </Box>;

  const datasets = visibleNames.map((name) => {
    const color = LINE_COLORS[names.indexOf(name)];
    return { label: name, data: weeks.map((week) => valueFor(week, name)), borderColor: color, backgroundColor: color, pointBackgroundColor: color, pointBorderColor: theme.palette.background.paper, pointBorderWidth: 2, pointRadius: weeks.length === 1 ? 5 : 3, pointHoverRadius: 6, borderWidth: 2, tension: 0, spanGaps: false };
  });
  const options = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderWidth: 1, titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary, padding: 12,
        callbacks: { label: (context) => ` ${context.dataset.label}: ${metric === 'rank' ? `#${context.parsed.y}` : `${context.parsed.y.toLocaleString()} views`}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 11 }, maxTicksLimit: 6, maxRotation: 0 } },
      y: { beginAtZero: metric === 'views', reverse: metric === 'rank', min: metric === 'rank' ? 1 : 0, max: metric === 'rank' ? 10 : undefined,
        grid: { color: theme.palette.divider }, border: { display: false },
        ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 11 }, maxTicksLimit: 6, precision: 0, callback: (value) => metric === 'rank' ? `#${value}` : shortNumber(value) },
      },
    },
  };

  return <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', bgcolor: 'background.paper', p: { xs: 2.5, md: 3.5 } }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
      <Box><Typography component="h2" sx={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.03em', mb: 0.75 }}>Interest over time</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>Compare the latest top 10 actors by weekly Wikipedia interest.</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>Latest data: {formatWeek(latest.week)}, {latest.week.slice(0, 4)}</Typography>
      </Box>
      <ToggleButtonGroup exclusive value={metric} onChange={(_, value) => value && setMetric(value)} size="small" aria-label="Trend metric" sx={{ alignSelf: 'flex-start', '& button': { fontSize: 11, px: 1.5, textTransform: 'none' } }}>
        <ToggleButton value="views">Page views</ToggleButton><ToggleButton value="rank">Ranking</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
    <Box sx={{ height: { xs: 250, sm: 290 }, position: 'relative' }}>
      {visibleNames.length ? <Line data={{ labels: weeks.map((entry) => formatWeek(entry.week)), datasets }} options={options} role="img" aria-label={`Weekly ${metric === 'rank' ? 'popularity rankings' : 'Wikipedia page views'} for ${visibleNames.join(', ')}`} /> : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: 'text.secondary', fontSize: 13 }}>Select an actor below to see their trend.</Box>}
    </Box>
    <Box role="group" aria-label="Actors shown in chart" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 3, pb: 2 }}>
      {names.map((name, index) => <Button key={name} size="small" aria-pressed={selected.includes(name)} onClick={() => toggleActor(name)} sx={{ px: 1, py: 0.5, minHeight: 34, fontSize: 11, fontWeight: 400, color: selected.includes(name) ? 'text.primary' : 'text.secondary', bgcolor: selected.includes(name) ? 'action.selected' : 'transparent', border: 1, borderColor: selected.includes(name) ? 'divider' : 'transparent' }}>
        <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: LINE_COLORS[index], mr: 0.8 }} />{name}
      </Button>)}
    </Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1} sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.6 }}>{weeks.length === 1 ? 'One week of data so far. More snapshots will reveal the trend.' : 'Gaps mean no recorded value for that week.'} {metric === 'rank' ? 'Lower rank is better.' : 'Missing values are not counted as zero.'}</Typography>
      <Button size="small" onClick={() => setSelection(visibleNames.length === names.length ? names.slice(0, 5) : names)} sx={{ px: 0, minWidth: 'auto', flexShrink: 0, fontSize: 11, alignSelf: 'flex-start' }}>{visibleNames.length === names.length ? 'Reset to top 5' : `Show all ${names.length}`}</Button>
    </Stack>
    <Box component="details" sx={{ mt: 2, fontSize: 11, color: 'text.secondary', '& summary': { cursor: 'pointer', width: 'fit-content' } }}>
      <summary>View chart data</summary>
      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', '& th, & td': { p: 1, borderBottom: 1, borderColor: 'divider', whiteSpace: 'nowrap' } }}>
          <caption style={{ textAlign: 'left', padding: '8px' }}>{metric === 'rank' ? 'Weekly popularity ranking' : 'Weekly Wikipedia page views'}</caption>
          <thead><tr><th scope="col">Week</th>{visibleNames.map((name) => <th key={name} scope="col">{name}</th>)}</tr></thead>
          <tbody>{weeks.map((entry) => <tr key={entry.week}><th scope="row">{entry.week}</th>{visibleNames.map((name) => <td key={name}>{valueFor(entry, name) === null ? 'Not recorded' : metric === 'rank' ? `#${valueFor(entry, name)}` : valueFor(entry, name).toLocaleString()}</td>)}</tr>)}</tbody>
        </Box>
      </Box>
    </Box>
  </Box>;
}

export default ActorTrendChart;
