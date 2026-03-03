import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-black dark:text-white no-underline">
          La Carta
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white no-underline">
            Home
          </Link>
          {user && (
            <>
              <Link to="/create" className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white no-underline">
                Create
              </Link>
              <Link to="/favorites" className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white no-underline">
                Favorites
              </Link>
              <Link to="/notes" className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white no-underline">
                Notes
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white no-underline">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 no-underline"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
