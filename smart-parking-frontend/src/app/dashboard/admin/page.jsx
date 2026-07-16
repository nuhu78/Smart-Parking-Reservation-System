'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Map, Grid, ShieldAlert, CalendarCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b pb-4 flex items-center text-slate-800">
        <ShieldAlert className="mr-3 text-red-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-slate-600">Logged in as {user?.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Manage Locations Card */}
        <Link href="/dashboard/admin/locations">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition cursor-pointer group">
            <Map className="text-slate-400 group-hover:text-slate-800 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Manage Locations</h2>
            <p className="text-slate-600">Add, edit, or remove physical parking areas (e.g., North Campus).</p>
          </div>
        </Link>

        {/* Manage Slots Card */}
        <Link href="/dashboard/admin/slots">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition cursor-pointer group">
            <Grid className="text-slate-400 group-hover:text-slate-800 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Manage Slots</h2>
            <p className="text-slate-600">Generate new parking spaces and assign them to your locations.</p>
          </div>
        </Link>

        {/* Manage Reservations Card */}
        <Link href="/dashboard/admin/reservations">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition cursor-pointer group">
            <CalendarCheck className="text-slate-400 group-hover:text-slate-800 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Manage Reservations</h2>
            <p className="text-slate-600">View and monitor all user reservations across locations.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}