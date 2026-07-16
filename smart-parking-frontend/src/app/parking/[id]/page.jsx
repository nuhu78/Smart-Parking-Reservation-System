'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

// Helper: format a Date to the `datetime-local` input value (YYYY-MM-DDTHH:mm)
function toLocalDateTimeString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function ParkingAreaDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaName, setAreaName] = useState('');

  // Time selection state
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 10 * 60 * 1000); // 10 min from now
  const defaultEnd = new Date(now.getTime() + 70 * 60 * 1000);   // 1 hour after start

  const [startTime, setStartTime] = useState(toLocalDateTimeString(defaultStart));
  const [endTime, setEndTime] = useState(toLocalDateTimeString(defaultEnd));
  const [timeError, setTimeError] = useState('');

  // Modal State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Validate times and return true if valid
  const validateTimes = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const currentTime = new Date();

    if (s <= currentTime) {
      setTimeError('Start time must be in the future');
      return false;
    }
    if (s >= e) {
      setTimeError('Start time must be before end time');
      return false;
    }
    const maxDuration = 4 * 60 * 60 * 1000; // 4 hours
    if (e.getTime() - s.getTime() > maxDuration) {
      setTimeError('Reservation duration cannot exceed 4 hours');
      return false;
    }
    setTimeError('');
    return true;
  };

  // Fetch available slots for the selected time range
  const fetchAvailableSlots = async () => {
    if (!validateTimes(startTime, endTime)) return;

    try {
      setLoading(true);
      const s = new Date(startTime).toISOString();
      const e = new Date(endTime).toISOString();
      const response = await api.get(`/slots/available/${id}?startTime=${s}&endTime=${e}`);
      const sortedSlots = response.data.sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
      setSlots(sortedSlots);

      // Get area name from first slot if available
      if (sortedSlots.length > 0 && sortedSlots[0].parkingArea) {
        setAreaName(sortedSlots[0].parkingArea.name);
      }
    } catch (error) {
      console.error('Failed to fetch available slots', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch all slots for this area
  useEffect(() => {
    const fetchInitialSlots = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/slots?parkingAreaId=${id}`);
        const sortedSlots = response.data.sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
        setSlots(sortedSlots);

        if (sortedSlots.length > 0 && sortedSlots[0].parkingArea) {
          setAreaName(sortedSlots[0].parkingArea.name);
        }
      } catch (error) {
        console.error('Failed to fetch slots', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSlots();
  }, [id]);

  // Book the selected slot with the chosen time range
  const handleBookSlot = async () => {
    try {
      setIsBooking(true);
      const s = new Date(startTime).toISOString();
      const e = new Date(endTime).toISOString();
      await api.post('/reservations', { slotId: selectedSlot.id, startTime: s, endTime: e });
      setBookingSuccess(true);

      // Remove the booked slot from the available list
      setSlots(slots.filter(slot => slot.id !== selectedSlot.id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book slot.');
    } finally {
      setIsBooking(false);
    }
  };

  // Format time for display in the modal
  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Locations
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {areaName ? `${areaName} — Select a Slot` : 'Select a Parking Slot'}
        </h1>
        <p className="text-slate-600 mt-2">Choose your time range, then pick an available slot.</p>
      </div>

      {/* Time Selection Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <Clock size={20} className="text-slate-600 mr-2" />
          <h2 className="text-lg font-semibold text-slate-800">Select Reservation Time</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                validateTimes(e.target.value, endTime);
              }}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                validateTimes(startTime, e.target.value);
              }}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchAvailableSlots}
            disabled={!!timeError}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Availability
          </button>
        </div>

        {timeError && (
          <p className="text-red-500 text-sm mt-2">{timeError}</p>
        )}
        <p className="text-xs text-slate-500 mt-2">Maximum reservation duration: 4 hours</p>
      </div>

      {/* Slot Grid */}
      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading slots...</div>
      ) : slots.length === 0 ? (
        <div className="text-center bg-white p-10 rounded shadow-sm text-slate-500 border">
          No available slots found for this time range. Try a different time.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {slots.map((slot) => {
            const isAvailable = slot.status === 'available';

            return (
              <div
                key={slot.id}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition text-center
                  ${isAvailable
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer'
                    : 'border-red-500 bg-red-50 cursor-not-allowed'}
                `}
                onClick={() => {
                  if (isAvailable) {
                    setSelectedSlot(slot);
                    setBookingSuccess(false);
                  }
                }}
              >
                <span className={`text-2xl font-bold ${!isAvailable ? 'text-red-700' : 'text-slate-800'}`}>
                  {slot.slotNumber}
                </span>
                <span className={`text-xs font-bold mt-2 px-2 py-1 rounded uppercase tracking-wide
                  ${isAvailable ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'}
                `}>
                  {isAvailable ? 'available' : slot.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* THE BOOKING MODAL */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            {!bookingSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Confirm Booking</h2>
                <div className="space-y-3 mb-6">
                  <p className="text-slate-600">
                    Reserve slot <strong>{selectedSlot.slotNumber}</strong>?
                  </p>
                  <div className="bg-slate-50 p-3 rounded text-sm space-y-1">
                    <p className="text-slate-700"><strong>From:</strong> {formatDateTime(startTime)}</p>
                    <p className="text-slate-700"><strong>To:</strong> {formatDateTime(endTime)}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    An email confirmation will be sent to you.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookSlot}
                    disabled={isBooking}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isBooking ? 'Booking...' : 'Confirm'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
                <p className="text-slate-600 mb-6">Your slot is booked. Check your email!</p>
                <button
                  onClick={() => router.push('/reservations')}
                  className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition"
                >
                  View My Reservations
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}