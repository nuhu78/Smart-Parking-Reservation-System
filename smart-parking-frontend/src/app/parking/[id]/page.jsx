'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft } from 'lucide-react';

export default function ParkingAreaDetails() {
  const { id } = useParams(); // Grabs the ID from the URL
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        // Fetch all slots
        const response = await api.get('/slots');
        // Filter slots to only show ones belonging to this parking area
        const areaSlots = response.data.filter(
          (slot) => String(slot.parkingArea?.id) === String(id)
        );
        // Sort them by slot number so they look nice
        const sortedSlots = areaSlots.sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
        
        setSlots(sortedSlots);
      } catch (error) {
        console.error('Failed to fetch slots', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Locations
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Select a Parking Slot</h1>
        <p className="text-slate-600 mt-2">Green slots are available to book.</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading slots...</div>
      ) : slots.length === 0 ? (
        <div className="text-center bg-white p-10 rounded shadow-sm text-slate-500 border">
          No slots have been created for this location yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {slots.map((slot) => {
            const isAvailable = slot.status === 'available';
            const isOccupied = slot.status === 'occupied';
            
            return (
              <div 
                key={slot.id}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition text-center
                  ${isAvailable 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer' 
                    : isOccupied
                      ? 'border-red-500 bg-red-50 cursor-not-allowed'
                      : 'border-slate-300 bg-slate-100 opacity-70 cursor-not-allowed'}
                `}
                onClick={() => {
                  if (isAvailable) {
                    alert(`You clicked slot ${slot.slotNumber}! Modal coming soon.`);
                  }
                }}
              >
                <span className={`text-2xl font-bold ${isOccupied ? 'text-red-700' : 'text-slate-800'}`}>
                  {slot.slotNumber}
                </span>
                <span className={`text-xs font-bold mt-2 px-2 py-1 rounded uppercase tracking-wide
                  ${isAvailable ? 'text-green-700 bg-green-200' : isOccupied ? 'text-red-700 bg-red-200' : 'text-slate-500 bg-slate-200'}
                `}>
                  {slot.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}