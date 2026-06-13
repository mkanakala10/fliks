import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Trending from './pages/trending';
import Actors from './pages/actors';
import AllMovies from './pages/allMovies';
import BoxOffice from './pages/BoxOffice';
import Signup from './pages/signup';
import Search from './pages/search';
import MovieDetails from './pages/movieDetails';
import MovieMeterChatbot from './components/MovieMeterChatbot';
import Account from './pages/account';
import Settings from './pages/settings';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { pathForPage, pageFromPath } from './navigation';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { ratings, rateMovie } = useUserData();
  const currentPage = pageFromPath(location.pathname);

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

  const handleRate = async (movieId, value) => {
    if (!isAuthenticated) {
      alert('Please sign in to rate movies.');
      navigate(pathForPage('signup'));
      return;
    }
    try {
      await rateMovie(movieId, value);
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
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
        <Route path="/recommendations" element={<Navigate to="/account?tab=for-you" replace />} />
        <Route path="/watch-later" element={<Navigate to="/account?tab=watchlist" replace />} />
        <Route path="/ratings" element={<Navigate to="/account?tab=ratings" replace />} />
        <Route path="/account" element={<Account {...sharedProps} />} />
        <Route path="/settings" element={<Settings />} />
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
          <UserDataProvider>
            <AppContent />
          </UserDataProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

export default App;
