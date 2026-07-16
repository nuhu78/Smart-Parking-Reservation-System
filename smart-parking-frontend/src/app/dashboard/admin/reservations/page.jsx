'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Calendar, MapPin, User, Filter } from 'lucide-react';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/reservations${query}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      case 'expired':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">All Reservations</h1>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 bg-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center bg-white p-10 rounded shadow-sm text-slate-500 border">
          No reservations found{statusFilter ? ` with status "${statusFilter}"` : ''}.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location / Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{res.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={16} className="text-slate-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{res.user?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{res.user?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-slate-400 mr-2" />
                      <div>
                        <div className="text-sm text-slate-900">{res.slot?.parkingArea?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">Slot {res.slot?.slotNumber || '?'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-700">
                      <Calendar size={14} className="text-slate-400 mr-1" />
                      {new Date(res.startTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-700">
                      <Calendar size={14} className="text-slate-400 mr-1" />
                      {new Date(res.endTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-slate-500">
        Showing {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
