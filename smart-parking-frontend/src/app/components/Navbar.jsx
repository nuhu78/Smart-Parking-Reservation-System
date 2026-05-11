'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Car } from 'lucide-react'; // A cool car icon for your logo

export default function Navbar() {
  const router = useRouter();
  // Pull our global state
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout(); // Clears the cookies and state
    router.push('/login'); // Sends them back to login
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition">
            <Car size={28} />
            <span className="font-bold text-xl tracking-wide">SmartPark</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4 items-center">
            {/* If NOT logged in, show Login/Register */}
            {!user ? (
              <>
                <Link href="/login" className="hover:text-green-400 transition font-medium">Log In</Link>
                <Link href="/register" className="bg-green-600 px-4 py-2 rounded font-medium hover:bg-green-500 transition">
                  Register
                </Link>
              </>
            ) : (
              /* If logged in, show their specific Dashboard and Logout */
              <>
                {user.role === 'admin' ? (
                  <Link href="/dashboard/admin" className="hover:text-green-400 transition font-medium">Admin Panel</Link>
                ) : (
                  <Link href="/dashboard/user" className="hover:text-green-400 transition font-medium">My Dashboard</Link>
                )}
                
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-sm text-slate-300 font-semibold hidden md:block">Hi, {user.fullName}</span>
                
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-red-500 transition ml-4"
                >
                  Log Out
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}