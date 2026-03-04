import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to: string;
}

export default function BackButton({ to }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700 dark:text-neutral-300">
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}
