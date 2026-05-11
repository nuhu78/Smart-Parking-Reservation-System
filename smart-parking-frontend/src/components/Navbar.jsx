import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Smart Parking System
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/register" className="hover:text-slate-900">
            Register
          </Link>
          <Link href="/login" className="hover:text-slate-900">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}