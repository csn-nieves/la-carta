import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  message: string;
  children?: ReactNode;
}

export default function EmptyState({ icon, message, children }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      {children ?? <p className="text-4xl mb-4">{icon}</p>}
      <p className="text-neutral-500 dark:text-neutral-400">{message}</p>
    </div>
  );
}
