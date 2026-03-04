import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractAxiosError } from '../lib/utils';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(extractAxiosError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="alert-error">{error}</div>
        )}
        <div>
          <label className="form-label mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="form-label mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-black dark:text-white no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
