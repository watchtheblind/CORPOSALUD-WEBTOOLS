// apps/frontend/src/app/layout.tsx
import './globals.css';
import content from '@/constants/content.constants';
import Navbar from '@/components/shadcn-space/blocks/navbar-01/navbar';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="min-h-screen bg-base-200">{children}</main>
        <footer className="footer footer-center p-4 text-white bg-base-300">
          <p>{content.COPYRIGHT}</p>
        </footer>
      </body>
    </html>
  );
}
