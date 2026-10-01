import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Trending from './pages/trending';
import Actors from './pages/actors';
import AllMovies from './pages/allMovies';
import BoxOffice from './pages/BoxOffice';
import Ratings from './pages/ratings';
import WatchLater from './pages/watchLater';
import Signup from './pages/signup';
import Search from './pages/search';
import MovieDetails from './pages/movieDetails';
import FliksChatbot from './components/FliksChatbot';
import Account from './pages/account';
import Settings from './pages/settings';
import Navbar from './components/Navbar';
import CinemaIntro from './components/CinemaIntro';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { pathForPage, pageFromPath } from './navigation';
import { ToastProvider, useToast } from './contexts/ToastContext';

const INTRO_STORAGE_KEY = 'fliks-intro-seen';

function AppContent() {
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(() => {
    if (location.pathname !== '/') return false;
    try {
      const hasSeenIntro = localStorage.getItem(INTRO_STORAGE_KEY) === '1'
        || sessionStorage.getItem(INTRO_STORAGE_KEY) === '1';
      if (hasSeenIntro) localStorage.setItem(INTRO_STORAGE_KEY, '1');
      return !hasSeenIntro;
    }
    catch { return true; }
  });
  const finishIntro = useCallback(() => {
    try { localStorage.setItem(INTRO_STORAGE_KEY, '1'); } catch { /* Storage can be unavailable in private browsing. */ }
    setIsIntroOpen(false);
    requestAnimationFrame(() => document.querySelector('[aria-label="Fliks home"]')?.focus({ preventScroll: true }));
  }, []);
  const replayIntro = () => { window.scrollTo(0, 0); setIsIntroOpen(true); };
  const { isAuthenticated } = useAuth();
  const { ratings, rateMovie } = useUserData();
  const currentPage = pageFromPath(location.pathname);

  useEffect(() => {
    const redirect =
      sessionStorage.getItem('fliksRedirect') || sessionStorage.getItem('movieMeterRedirect');
    if (redirect) {
      sessionStorage.removeItem('fliksRedirect');
      sessionStorage.removeItem('movieMeterRedirect');
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  const handleToggleNav = () => setIsNavOpen((prev) => !prev);

  const handleNavigate = (pageId) => {
    navigate(pathForPage(pageId));
    setIsNavOpen(false);
  };

  const handleViewMovie = (movieId) => {
    navigate(`/movie/${movieId}`);
    setIsNavOpen(false);
  };

  const handleRate = async (movieId, value) => {
    if (!isAuthenticated) {
      showToast('Please sign in to rate movies.', 'warning');
      navigate(pathForPage('signup'));
      return;
    }
    try {
      await rateMovie(movieId, value);
    } catch (error) {
      console.error('Failed to save rating:', error);
      showToast('Your rating couldn’t be updated. Please try again.', 'error');
    }
  };

  const sharedProps = {
    onNavigate: handleNavigate,
    onViewMovie: handleViewMovie,
    onRate: handleRate,
    ratings,
    onReplayIntro: replayIntro,
  };

  return (
    <NavigationProvider
      onNavigate={handleNavigate}
      onToggleNav={handleToggleNav}
      onGoBack={() => navigate(-1)}
    >
      {isIntroOpen && location.pathname === '/' && <CinemaIntro onComplete={finishIntro} />}
      <div inert={isIntroOpen && location.pathname === '/' ? true : undefined} aria-hidden={isIntroOpen && location.pathname === '/' ? true : undefined}>
      <Navbar
        isOpen={isNavOpen}
        onToggle={handleToggleNav}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <Routes>
        <Route path="/" element={<Home {...sharedProps} />} />
        <Route path="/trending" element={<Trending {...sharedProps} />} />
        <Route path="/search" element={<Search {...sharedProps} />} />
        <Route path="/recommendations" element={<Navigate to="/account?tab=for-you" replace />} />
        <Route path="/watch-later" element={<WatchLater {...sharedProps} />} />
        <Route path="/ratings" element={<Ratings {...sharedProps} />} />
        <Route path="/account" element={<Account {...sharedProps} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/actors" element={<Actors {...sharedProps} />} />
        <Route path="/box-office" element={<BoxOffice {...sharedProps} />} />
        <Route path="/all-movies" element={<AllMovies {...sharedProps} />} />
        <Route path="/signup" element={<Signup onNavigate={handleNavigate} />} />
        <Route path="/ai-assistant" element={<FliksChatbot onViewMovie={handleViewMovie} />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="*" element={<Home {...sharedProps} />} />
      </Routes>
      </div>
    </NavigationProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ColorModeProvider>
        <AuthProvider>
          <ToastProvider>
            <UserDataProvider>
              <AppContent />
            </UserDataProvider>
          </ToastProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

export default App;
