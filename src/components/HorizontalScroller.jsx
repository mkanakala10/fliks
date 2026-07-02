import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
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
      {canScrollLeft && !shouldCenter && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          size="small"
          sx={{
            position: 'absolute',
            left: { xs: 0, md: -4 },
            top: '38%',
            zIndex: 2,
            opacity: { xs: 1, md: 0 },
            transition: 'opacity 0.2s',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <HiChevronLeft size={20} />
        </IconButton>
      )}

      {canScrollRight && !shouldCenter && (
        <IconButton
          className="scroll-arrow"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          size="small"
          sx={{
            position: 'absolute',
            right: { xs: 0, md: -4 },
            top: '38%',
            zIndex: 2,
            opacity: { xs: 1, md: 0 },
            transition: 'opacity 0.2s',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <HiChevronRight size={20} />
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
          scrollbarWidth: 'thin',
          pb: 1,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: 'rgba(99, 102, 241, 0.25)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'rgba(99, 102, 241, 0.5)',
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
