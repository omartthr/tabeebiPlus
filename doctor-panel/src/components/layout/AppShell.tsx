'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const noSidebar = path.startsWith('/auth') || path === '/';

  if (noSidebar) return <>{children}</>;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
