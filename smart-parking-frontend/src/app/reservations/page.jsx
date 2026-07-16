'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Calendar, MapPin, Trash2 } from 'lucide-react';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the user's reservations
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      // Calls the endpoint that gets ONLY this user's bookings
      const response = await api.get('/reservations/my');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      // Call the backend to delete the reservation (which frees the slot and sends the email!)
      await api.delete(`/reservations/${id}`);
      // Remove it from the screen without needing to refresh the page
      setReservations(reservations.filter(res => res.id !== id));
      alert("Reservation cancelled successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel reservation.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">My Reservations</h1>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center bg-white p-10 rounded shadow-sm text-slate-500 border">
          You don't have any active reservations.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res) => {
            const normalizedStatus = res.status;
            const isCancellable = normalizedStatus === 'active' && new Date(res.startTime) > new Date();

            return (
            <div key={res.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded uppercase ${
                      normalizedStatus === 'cancelled'
                        ? 'text-red-600 bg-red-50'
                        : normalizedStatus === 'active'
                          ? 'text-green-600 bg-green-50'
                          : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {normalizedStatus || 'unknown'}
                  </span>
                </div>
                {isCancellable && (
                  <button 
                    onClick={() => handleCancel(res.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded transition flex items-center"
                    title="Cancel Booking"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-slate-700">
                  <MapPin size={18} className="mr-2 text-slate-400" />
                  {/* Pulling the full location name and slot number */}
                  <span className="font-medium">{res.slot?.parkingArea?.name} - Slot {res.slot?.slotNumber}</span> 
                </div>
                
                <div className="flex items-center text-slate-700">
                  <Calendar size={18} className="mr-2 text-slate-400" />
                  <span className="text-sm">
                    {new Date(res.startTime).toLocaleString()} – {new Date(res.endTime).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}