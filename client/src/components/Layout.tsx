import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileDock from './MobileDock';
import InstallBanner from './InstallBanner';

export default function Layout() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-16">
        <Outlet />
      </main>
      <MobileDock />
      <InstallBanner />
    </div>
  );
}
