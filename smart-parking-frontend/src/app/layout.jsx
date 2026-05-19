import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart Parking System',
  description: 'Book your parking slot instantly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        {/* The Navbar sits at the very top of the app */}
        <Navbar />
        
        {/* The current page gets rendered inside this main tag */}
        <main className="grow">
          {children}
        </main>
      </body>
    </html>
  );
}