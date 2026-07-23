import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme, alpha } from '@mui/material/styles';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useItemsPerView } from '../hooks/useItemsPerView';

function HorizontalScroller({
  items,
  renderItem,
  getKey,
  gap = 3,
  emptyMessage,
  centerWhenFits = false,
  cardVariant = 'movie',
}) {
  const scrollRef = useRef(null);
  const itemsPerView = useItemsPerView(cardVariant);
  const isActor = cardVariant === 'actor';
  const theme = useTheme();
  const gapPx = parseFloat(theme.spacing(gap));
  const itemBasis = `calc((100% - ${(itemsPerView - 1) * gapPx}px) / ${itemsPerView})`;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [items, itemsPerView]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.92, behavior: 'smooth' });
  };

  if (!items?.length) {
    return emptyMessage ? (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>{emptyMessage}</Box>
    ) : null;
  }

  const fitsInView = items.length <= itemsPerView;
  const shouldCenter = centerWhenFits && fitsInView;

  return (
    <Box sx={{ position: 'relative', '&:hover .scroll-arrow': { opacity: 1 } }}>
      {/* Left Edge Fade Gradient */}
      {canScrollLeft && !shouldCenter && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: `linear-gradient(to right, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Right Edge Fade Gradient */}
      {canScrollRight && !shouldCenter && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: `linear-gradient(to left, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {canScrollLeft && !shouldCenter && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          sx={{
            position: 'absolute',
            left: { xs: 8, md: -14 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            opacity: { xs: 1, md: 0 },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 14, 38, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: 'primary.main',
            color: 'primary.main',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 10px rgba(99, 102, 241, 0.15)',
            p: 1.25,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), 0 0 15px rgba(217, 70, 239, 0.25)',
              borderColor: 'secondary.main',
            },
          }}
        >
          <HiChevronLeft size={24} />
        </IconButton>
      )}

      {canScrollRight && !shouldCenter && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          sx={{
            position: 'absolute',
            right: { xs: 8, md: -14 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            opacity: { xs: 1, md: 0 },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 14, 38, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: 'primary.main',
            color: 'primary.main',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 10px rgba(99, 102, 241, 0.15)',
            p: 1.25,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), 0 0 15px rgba(217, 70, 239, 0.25)',
              borderColor: 'secondary.main',
            },
          }}
        >
          <HiChevronRight size={24} />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          alignItems: isActor ? 'flex-start' : 'stretch',
          gap,
          overflowX: shouldCenter ? 'hidden' : 'auto',
          justifyContent: shouldCenter ? 'center' : 'flex-start',
          scrollSnapType: shouldCenter ? 'none' : 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          pb: 0.5,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {items.map((item, index) => (
          <Box
            key={getKey ? getKey(item, index) : index}
            sx={{
              flex: shouldCenter ? `0 1 ${itemBasis}` : `0 0 ${itemBasis}`,
              maxWidth: itemBasis,
              scrollSnapAlign: 'start',
              minWidth: 0,
              display: isActor ? 'block' : 'flex',
            }}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default HorizontalScroller;
