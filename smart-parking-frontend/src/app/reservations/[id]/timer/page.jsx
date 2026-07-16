'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, Car, Clock } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 90;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getDurationHours(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60) * 10) / 10;
}

export default function ParkingTimerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const fetchReservation = useCallback(async () => {
    try {
      const res = await api.get('/reservations/my');
      const found = res.data.find((r) => String(r.id) === String(id));
      setReservation(found || null);
      if (found) {
        const end = new Date(found.endTime).getTime();
        const total = end - new Date(found.startTime).getTime();
        setTotalDuration(total);
        setTimeLeft(Math.max(0, end - Date.now()));
      }
    } catch (error) {
      console.error('Failed to fetch reservation', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => {
      const end = new Date(reservation.endTime).getTime();
      setTimeLeft(Math.max(0, end - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <div className="card-dark p-6 animate-pulse space-y-6">
          <div className="h-6 bg-slate-700/30 rounded w-24" />
          <div className="w-64 h-64 rounded-full bg-slate-700/30 mx-auto" />
          <div className="h-4 bg-slate-700/30 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <button onClick={() => router.back()} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-6">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
        <div className="card-dark p-10 text-center text-[var(--text-secondary)]">
          <Car size={40} className="mx-auto mb-3 opacity-40" />
          Reservation not found.
        </div>
      </div>
    );
  }

  const dur = getDurationHours(reservation.startTime, reservation.endTime);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
      <button onClick={() => router.back()} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-4">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <div className="card-dark p-6 sm:p-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Clock size={20} className="text-[var(--accent-purple)]" />
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Parking Timer</h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(124, 58, 237, 0.15)"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--accent-purple)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-baseline space-x-3">
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tabular-nums">
                    {String(hours).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Hours</p>
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-[var(--accent-purple)]">:</span>
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tabular-nums">
                    {String(minutes).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Minutes</p>
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-[var(--accent-purple)]">:</span>
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tabular-nums">
                    {String(seconds).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] rounded-xl p-4 space-y-2.5 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Parking Area</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.slot?.parkingArea?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Vehicle Number</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.vehicleNumber || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Duration</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{dur} hour{dur !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Parking Slot</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.slot?.slotNumber || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Date</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{formatDate(reservation.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Time</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{formatTime(reservation.startTime)} — {formatTime(reservation.endTime)}</span>
          </div>
        </div>

        <button className="btn-primary w-full text-sm" disabled={timeLeft <= 0}>
          Expand Parking Time
        </button>

        {timeLeft <= 0 && (
          <p className="text-xs text-[var(--status-active)] text-center mt-3 font-medium">
            Parking session has ended.
          </p>
        )}
      </div>
    </div>
  );
}
