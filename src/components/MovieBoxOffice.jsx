import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import Button from './Button';
import { buildBoxOfficeSeries, fetchBoxOfficeHistory } from '../utils/boxOfficeHistory';

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Filler, Tooltip);
const money = (value) => value === null ? 'Not available' : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} cr`;
const dateLabel = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function EarningsChart({ record }) {
  const theme = useTheme();
  const [metric, setMetric] = useState('cumulative');
  const [range, setRange] = useState('all');
  const series = buildBoxOfficeSeries(record);
  const points = range === 'all' ? series : series.filter((point) => point.day <= Number(range));
  const recorded = points.filter((point) => point.daily !== null);
  const latest = points.at(-1);
  const best = recorded.reduce((result, point) => !result || point.daily > result.daily ? point : result, null);
  const color = theme.palette.primary.main;
  const options = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: theme.palette.background.paper, titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary, borderColor: theme.palette.divider, borderWidth: 1, padding: 12,
      callbacks: { title: (items) => { const point = points[items[0].dataIndex]; return `Day ${point.day} · ${dateLabel(point.date)}`; }, label: (item) => `${metric === 'daily' ? 'Daily earnings' : 'Cumulative earnings'}: ${money(item.parsed.y)}`, afterLabel: (item) => { const change = points[item.dataIndex].change; return metric === 'daily' && change !== null ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs previous day` : ''; } },
    } },
    scales: { x: { grid: { display: false }, ticks: { color: theme.palette.text.secondary, font: { size: 11 }, maxTicksLimit: 7, maxRotation: 0 }, title: { display: true, text: 'Days since theatrical release', color: theme.palette.text.secondary, font: { size: 11 } } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary, maxTicksLimit: 6, callback: (value) => `₹${value} cr`, font: { size: 11 } } } },
  };
  return <Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
      <Box><Typography component="h2" sx={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.03em' }}>{record.title} at the box office</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>{record.scope} · INR crores</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11, mt: 0.5 }}>{record.coverage}</Typography></Box>
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 2.5, gap: 2.5, mb: 3 }}>
      {[[`Total through day ${latest?.day || '—'}`, money(latest?.cumulative ?? null)], ['Best recorded day', best ? `${money(best.daily)} · Day ${best.day}` : 'Not available'], ['Latest daily change', latest?.change == null ? 'Not available' : `${latest.change >= 0 ? '+' : ''}${latest.change.toFixed(1)}%`]].map(([label, value]) => <Box key={label}><Typography sx={{ color: 'text.secondary', fontSize: 11, mb: 0.75 }}>{label}</Typography><Typography sx={{ fontSize: 21, fontWeight: 500 }}>{value}</Typography></Box>)}
    </Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
      <ToggleButtonGroup exclusive value={metric} onChange={(_, value) => value && setMetric(value)} size="small" aria-label="Earnings metric" sx={{ alignSelf: 'flex-start', '& button': { px: 2, fontSize: 12, textTransform: 'none' } }}><ToggleButton value="cumulative">Cumulative</ToggleButton><ToggleButton value="daily">Daily earnings</ToggleButton></ToggleButtonGroup>
      <TextField select label="Period" size="small" value={range} onChange={(event) => setRange(event.target.value)} sx={{ width: { xs: '100%', sm: 175 }, '& .MuiOutlinedInput-root': { fontSize: 12 } }}><MenuItem value="7">First 7 days</MenuItem><MenuItem value="14">First 14 days</MenuItem><MenuItem value="all">All recorded days</MenuItem></TextField>
    </Stack>
    {recorded.length ? <Box sx={{ height: { xs: 270, sm: 340 } }}><Line options={options} data={{ labels: points.map((point) => `Day ${point.day}`), datasets: [{ label: 'Earnings', data: points.map((point) => point[metric]), borderColor: color, backgroundColor: `${color}18`, pointBackgroundColor: color, fill: true, tension: 0, spanGaps: false, borderWidth: 2, pointRadius: points.length > 35 ? 0 : 3, pointHoverRadius: 5 }] }} role="img" aria-label={`${record.title} ${metric} box-office earnings in INR crores`} /></Box> : <Typography sx={{ color: 'text.secondary', py: 5 }}>No daily earnings have been recorded for this period.</Typography>}
    {points.some((point) => point.daily === null) && <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 2 }}>Some daily reports are missing. Cumulative totals stop at the first gap; missing earnings are not treated as zero.</Typography>}
    <Typography sx={{ color: 'text.secondary', fontSize: 11, lineHeight: 1.8, mt: 3 }}>Source: <Box component="a" href={record.source.url} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>{record.source.name}</Box> · Verified {record.verifiedOn}. Historical figures for the period shown; not a live feed or a worldwide lifetime total.</Typography>
    <Box component="details" sx={{ mt: 2.5, color: 'text.secondary', fontSize: 12, '& summary': { cursor: 'pointer' } }}><summary>View daily figures</summary><Box sx={{ overflowX: 'auto', mt: 2 }}><Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', '& th, & td': { p: 1.25, borderBottom: 1, borderColor: 'divider', whiteSpace: 'nowrap' } }}><caption style={{ textAlign: 'left' }}>{record.scope} · INR crores</caption><thead><tr><th scope="col">Day / date</th><th scope="col">Daily</th><th scope="col">Cumulative</th><th scope="col">Daily change</th></tr></thead><tbody>{points.map((point) => <tr key={point.date}><th scope="row">Day {point.day} · {dateLabel(point.date)}</th><td>{money(point.daily)}</td><td>{money(point.cumulative)}</td><td>{point.change === null ? '—' : `${point.change >= 0 ? '+' : ''}${point.change.toFixed(1)}%`}</td></tr>)}</tbody></Box></Box></Box>
  </Box>;
}

export default function MovieBoxOffice({ movieId, movieTitle }) {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError(false);
      try { const data = await fetchBoxOfficeHistory(controller.signal); if (!controller.signal.aborted) setRecords(data); }
      catch { if (!controller.signal.aborted) setError(true); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [attempt]);
  if (loading) return <Box role="status" aria-label="Loading box-office history" sx={{ py: 8, textAlign: 'center' }}><CircularProgress size={26} /></Box>;
  if (error) return <Box role="alert" sx={{ py: 4 }}><Typography sx={{ mb: 2 }}>Box-office history couldn’t be loaded.</Typography><Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>Try again</Button></Box>;
  const activeId = movieId || Number(selected) || records[0]?.movieId;
  const record = records.find((item) => item.movieId === activeId);
  if (!record) return <Box sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider', borderRadius: '6px' }}><Typography component="h2" sx={{ fontSize: 22, mb: 1 }}>Earnings history isn’t available yet</Typography><Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.8, mb: 2 }}>We don’t have dated box-office reports for {movieTitle || 'this film'}. A lifetime total alone can’t show how earnings changed over time.</Typography><Button component={RouterLink} to="/box-office?tab=trends" variant="secondary">Explore available movie trends</Button></Box>;
  return <Box>
    {!movieId && <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 3 }}><TextField select label="Choose a movie" value={activeId} onChange={(event) => setSelected(event.target.value)} size="small" sx={{ width: { xs: '100%', sm: 300 } }}>{records.map((item) => <MenuItem key={item.movieId} value={item.movieId}>{item.title} ({item.releaseDate.slice(0, 4)})</MenuItem>)}</TextField><Button component={RouterLink} to={`/movie/${activeId}?tab=box-office`} variant="secondary" size="small">Open movie page</Button></Stack>}
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', bgcolor: 'background.paper', p: { xs: 2.5, md: 3.5 } }}><EarningsChart key={activeId} record={record} /></Box>
  </Box>;
}
