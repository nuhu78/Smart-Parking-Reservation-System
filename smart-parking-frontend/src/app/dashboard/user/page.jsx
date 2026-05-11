'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Search } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch parking areas whenever the page loads or the search term changes
  useEffect(() => {
    const fetchParking = async () => {
      try {
        setLoading(true);
        // Using the search feature we discussed earlier!
        const response = await api.get(`/parking?search=${searchTerm}`);
        setParkingAreas(response.data);
      } catch (error) {
        console.error('Failed to fetch parking areas', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search so we don't spam the backend
    const delayDebounce = setTimeout(() => {
      fetchParking();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user?.fullName || 'Driver'}!</h1>
        <p className="text-slate-600 mt-2">Find and book your parking spot instantly.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
          placeholder="Search for a parking location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Parking Area Grid */}
      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading locations...</div>
      ) : parkingAreas.length === 0 ? (
        <div className="text-center bg-white p-10 rounded shadow-sm text-slate-500 border">
          No parking areas found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingAreas.map((area) => (
            <Link href={`/parking/${area.id}`} key={area.id}>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-green-500 transition cursor-pointer group">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-slate-100 p-3 rounded-full group-hover:bg-green-100 transition">
                    <MapPin className="text-slate-700 group-hover:text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{area.name}</h2>
                    <p className="text-sm text-slate-600">{area.location || 'Location not specified'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    View Slots
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}