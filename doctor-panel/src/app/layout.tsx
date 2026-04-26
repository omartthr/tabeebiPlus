import type { Metadata } from 'next';
import '@/app/globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'tabeebi+ | Doktor Paneli',
  description: 'Tabeebi+ Doktor Yönetim Paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <div className="app">
          <Sidebar />
          <main className="main" id="page-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
