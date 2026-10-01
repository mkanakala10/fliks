import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useColorMode } from '../contexts/ColorModeContext';
import './CinemaIntro.css';

const CinemaScene = lazy(() => import('./CinemaScene'));
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function CinemaIntro({ onComplete }) {
  const { mode, toggleColorMode } = useColorMode();
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState('selection');
  const [cameraStage, setCameraStage] = useState('descending');
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const rootRef = useRef(null);
  const skipRef = useRef(null);
  const logoRef = useRef(null);
  const timerRef = useRef(null);
  const completed = useRef(false);
  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    skipRef.current?.focus({ preventScroll: true });
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => {
      document.body.style.overflow = overflow;
      preference.removeEventListener('change', update);
      clearTimeout(timerRef.current);
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, []);

  // Escape always exits. Keep keyboard focus inside the intro while the site is inert.
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key !== 'Tab') return;
    const buttons = [...rootRef.current.querySelectorAll('button:not(:disabled)')]
      .filter((button) => !button.closest('[inert]'));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  const arrive = useCallback(() => {
    setPhase('morph');
  }, []);
  useEffect(() => {
    if (phase !== 'morph') return;
    const logo = logoRef.current;
    const destination = document.querySelector('[aria-label="Fliks home"]');
    const target = destination?.getBoundingClientRect();
    const previousDestinationOpacity = destination?.style.opacity;
    const previousDestinationTransition = destination?.style.transition;
    if (destination) {
      destination.style.opacity = '0';
      destination.style.transition = 'none';
    }
    const frame = requestAnimationFrame(() => {
      if (target && logo && !reducedMotion) {
        const bounds = logo.getBoundingClientRect();
        logo.style.transform = `translate(${target.left - bounds.left}px, ${target.top - bounds.top}px) scale(${target.height / bounds.height})`;
      }
      rootRef.current?.classList.add('cinema-intro--reveal');
    });
    const handoffTimer = setTimeout(() => {
      logo?.classList.add('is-handing-off');
      if (destination) {
        destination.style.transition = 'opacity 160ms ease';
        destination.style.opacity = '1';
      }
    }, reducedMotion ? 0 : 790);
    timerRef.current = setTimeout(finish, reducedMotion ? 180 : 980);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(handoffTimer);
      clearTimeout(timerRef.current);
      if (destination) {
        destination.style.opacity = previousDestinationOpacity || '';
        destination.style.transition = previousDestinationTransition || '';
      }
    };
  }, [phase, finish, reducedMotion]);

  useEffect(() => {
    if (phase !== 'entering') return;
    // A simple screen dissolve remains available when WebGL is unavailable.
    if (unavailable || reducedMotion || !ready) {
      timerRef.current = setTimeout(arrive, reducedMotion ? 100 : 1400);
    } else {
      timerRef.current = setTimeout(arrive, 12000);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, unavailable, ready, reducedMotion, arrive]);

  const selectSeat = (id) => setSelected((seats) => seats[0] === id ? [] : [id]);
  const start = () => {
    if (!selected.length) return;
    if (mode === 'dark') toggleColorMode();
    skipRef.current?.focus({ preventScroll: true });
    setPhase('entering');
  };
  return (
    <div ref={rootRef} className={`cinema-intro cinema-intro--${phase}`} role="dialog" aria-modal="true" aria-labelledby="cinema-intro-title" onKeyDown={handleKeyDown} data-phase={phase} data-scene-ready={ready} data-camera-stage={cameraStage}>
      {!reducedMotion && !unavailable && <div className="cinema-intro__scene" aria-hidden="true">
        <SceneBoundary onUnavailable={() => setUnavailable(true)}>
          <Suspense fallback={null}><CinemaScene selected={selected} active={phase === 'entering'} onReady={() => setReady(true)} onArrive={arrive} onStageChange={setCameraStage} /></Suspense>
        </SceneBoundary>
      </div>}
      <div className="cinema-intro__veil" />
      <header className="cinema-intro__header">
        <span className="cinema-intro__brand">fliks<span>.</span></span>
        <span className="cinema-intro__edition">THE PICTURE HOUSE</span>
        <button ref={skipRef} className="cinema-intro__skip" onClick={finish}>Skip intro <ArrowRight size={14} /></button>
      </header>
      <div className="cinema-intro__selection" inert={phase !== 'selection' ? true : undefined} aria-hidden={phase !== 'selection'}>
        <div className="cinema-intro__heading">
          <p className="cinema-intro__eyebrow">YOUR EVENING AT THE MOVIES</p>
          <h1 id="cinema-intro-title">Every story starts<br />with a good seat.</h1>
          <p>Pick a seat. Make yourself at home.</p>
        </div>
        <div className="cinema-intro__auditorium">
          <div className="cinema-intro__screen-line"><span>SCREEN</span></div>
          <div className="cinema-intro__seating" role="group" aria-label="Choose your cinema seat">
            {ROWS.map((row, rowIndex) => <div key={row} className="cinema-intro__row" style={{ '--row': rowIndex }}>
              <span className="cinema-intro__row-label" aria-hidden="true">{row}</span>
              {Array.from({ length: 10 }, (_, index) => {
                const id = `${row}${index + 1}`;
                return <button key={id} className={`cinema-intro__seat ${index === 5 ? 'cinema-intro__seat--aisle' : ''}`} aria-label={`Seat ${id}`} aria-pressed={selected.includes(id)} onClick={() => selectSeat(id)}><span>{index + 1}</span></button>;
              })}
              <span className="cinema-intro__row-label" aria-hidden="true">{row}</span>
            </div>)}
          </div>
          <div className="cinema-intro__legend"><span><i />Available</span><span><i className="is-selected" />Your selection</span></div>
        </div>
        <div className="cinema-intro__ticket">
          <div className="cinema-intro__ticket-detail" aria-live="polite"><span>YOUR SEAT</span><strong>{selected[0] || 'Choose a little escape'}</strong></div>
          {selected.length > 0 && <button className="cinema-intro__reset" aria-label="Clear seat selection" onClick={() => setSelected([])}><RotateCcw size={15} /></button>}
          <button className="cinema-intro__watch" disabled={!selected.length} onClick={start}>Watch <ArrowRight size={17} /></button>
        </div>
        <p className="cinema-intro__footnote">A front-row seat to Indian cinema.</p>
      </div>
      {phase === 'entering' && cameraStage === 'descending' && <div className="cinema-intro__flight-caption" role="status">Taking you to your seat<span>THE SHOW IS ABOUT TO BEGIN</span></div>}
      {phase === 'morph' && <div className="cinema-intro__morph"><span ref={logoRef} className="cinema-intro__morph-logo">fliks<span>.</span></span></div>}
    </div>
  );
}
