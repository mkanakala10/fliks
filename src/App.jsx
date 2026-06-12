import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/home';
import Trending from './pages/trending';
import WatchLater from './pages/watchLater';
import Ratings from './pages/ratings';
import Actors from './pages/actors';
import AllMovies from './pages/allMovies';
import BoxOffice from './pages/BoxOffice';
import Signup from './pages/signup';
import Search from './pages/search';
import Recommendations from './pages/recommendations';
import MovieDetails from './pages/movieDetails';
import MovieMeterChatbot from './components/MovieMeterChatbot';
import Navbar from './components/Navbar';
import { WatchLaterProvider } from './contexts/WatchLaterContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { pathForPage, pageFromPath } from './navigation';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('movieMeterRatings')) || {};
    } catch {
      return {};
    }
  });

  const { isAuthenticated } = useAuth();
  const currentPage = pageFromPath(location.pathname);

  useEffect(() => {
    localStorage.setItem('movieMeterRatings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    const redirect = sessionStorage.getItem('movieMeterRedirect');
    if (redirect) {
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

  const handleRate = (movieId, value) => {
    if (!isAuthenticated) {
      alert('Please sign up using Google to rate movies.');
      navigate(pathForPage('signup'));
      return;
    }
    setRatings((prev) => ({ ...prev, [movieId]: value }));
  };

  const sharedProps = {
    onNavigate: handleNavigate,
    onViewMovie: handleViewMovie,
    onRate: handleRate,
    ratings,
  };

  return (
    <NavigationProvider
      onNavigate={handleNavigate}
      onToggleNav={handleToggleNav}
      onGoBack={() => navigate(-1)}
    >
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
        <Route path="/recommendations" element={<Recommendations {...sharedProps} />} />
        <Route path="/watch-later" element={<WatchLater {...sharedProps} />} />
        <Route path="/ratings" element={<Ratings {...sharedProps} />} />
        <Route path="/actors" element={<Actors />} />
        <Route path="/box-office" element={<BoxOffice {...sharedProps} />} />
        <Route path="/all-movies" element={<AllMovies {...sharedProps} />} />
        <Route path="/signup" element={<Signup onNavigate={handleNavigate} />} />
        <Route path="/ai-assistant" element={<MovieMeterChatbot onViewMovie={handleViewMovie} />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="*" element={<Home {...sharedProps} />} />
      </Routes>
    </NavigationProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ColorModeProvider>
        <AuthProvider>
          <WatchLaterProvider>
            <AppContent />
          </WatchLaterProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

export default App;
