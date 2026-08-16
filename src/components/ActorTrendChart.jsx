import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Vibrant palette for up to 10 lines
const LINE_COLORS = [
  '#f97316', // orange
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#22c55e', // green
  '#f43f5e', // rose
  '#eab308', // yellow
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // teal
  '#8b5cf6', // violet
];

/**
 * Format a "YYYY-MM-DD" week string to a short readable label, e.g. "Aug 11".
 */
function formatWeekLabel(isoDate) {
  const date = new Date(isoDate + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * ActorTrendChart
 *
 * Renders a multi-line chart showing weekly Wikipedia pageview scores for the
 * top-10 trending Indian actors. Each line represents one actor.
 *
 * Props:
 *   history  – Array of { week: string, actors: [{name, trendingScore, rank}] }
 */
function ActorTrendChart({ history }) {
  // Need at least 1 data point to render anything useful
  if (!history || history.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 160,
          borderRadius: 3,
          border: '1px dashed rgba(255,255,255,0.12)',
          bgcolor: 'rgba(255,255,255,0.03)',
          mb: 4,
        }}
      >
        <Typography color="text.secondary" fontSize="0.95rem">
          No history data yet — check back after the first automated weekly update.
        </Typography>
      </Box>
    );
  }

  // Collect the union of all actor names that appear in any week's top-10
  const allActorNames = useMemo(() => {
    const set = new Set();
    history.forEach((entry) =>
      entry.actors.forEach((a) => set.add(a.name))
    );
    // Preserve order: rank from the most recent week first
    const latest = history[history.length - 1];
    const orderedNames = latest.actors.map((a) => a.name);
    // Append any names found in older weeks but not in the latest
    set.forEach((name) => {
      if (!orderedNames.includes(name)) orderedNames.push(name);
    });
    return orderedNames.slice(0, 10);
  }, [history]);

  const labels = history.map((entry) => formatWeekLabel(entry.week));

  const datasets = useMemo(
    () =>
      allActorNames.map((name, idx) => {
        const color = LINE_COLORS[idx % LINE_COLORS.length];
        const data = history.map((entry) => {
          const actor = entry.actors.find((a) => a.name === name);
          return actor ? actor.trendingScore : null;
        });

        return {
          label: name,
          data,
          borderColor: color,
          backgroundColor: color + '22', // 13% opacity fill
          pointBackgroundColor: color,
          pointBorderColor: '#1a1a2e',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          tension: 0.35,
          spanGaps: true, // connect lines even if a week is missing
          fill: false,
        };
      }),
    [allActorNames, history]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255,255,255,0.75)',
            font: { size: 11, family: "'Inter', sans-serif" },
            boxWidth: 14,
            boxHeight: 14,
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(15,15,30,0.92)',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.8)',
          padding: 12,
          callbacks: {
            label(ctx) {
              const val = ctx.parsed.y;
              if (val === null) return null;
              return ` ${ctx.dataset.label}: ${val.toLocaleString()} views`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255,255,255,0.06)',
          },
          ticks: {
            color: 'rgba(255,255,255,0.55)',
            font: { size: 11 },
          },
        },
        y: {
          grid: {
            color: 'rgba(255,255,255,0.06)',
          },
          ticks: {
            color: 'rgba(255,255,255,0.55)',
            font: { size: 11 },
            callback(value) {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
              if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
              return value;
            },
          },
          title: {
            display: true,
            text: 'Weekly Wikipedia Views',
            color: 'rgba(255,255,255,0.4)',
            font: { size: 11 },
          },
        },
      },
    }),
    []
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(10px)',
        p: { xs: 2, md: 3 },
        mb: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: 1,
            background: 'linear-gradient(180deg, #f97316 0%, #a855f7 100%)',
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography fontWeight={700} fontSize="1rem" lineHeight={1.2}>
            Trending Score Tracker
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary" lineHeight={1.4}>
            Weekly Wikipedia pageviews · Top 10 actors · Updates every Monday
          </Typography>
        </Box>
        {history.length === 1 && (
          <Box
            sx={{
              ml: 'auto',
              px: 1.5,
              py: 0.5,
              borderRadius: 99,
              bgcolor: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.3)',
            }}
          >
            <Typography fontSize="0.72rem" color="warning.main" fontWeight={600}>
              1 week — more history accumulates weekly
            </Typography>
          </Box>
        )}
      </Box>

      <Line data={{ labels, datasets }} options={options} />
    </Box>
  );
}

export default ActorTrendChart;
