'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { User, Save, ArrowLeft } from 'lucide-react';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const response = await api.patch('/auth/profile', { fullName: fullName.trim() });

      // Update the stored user data
      const updatedUser = { ...user, fullName: response.data.fullName || fullName.trim() };
      const token = Cookies.get('token');
      login(updatedUser, token);

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-slate-100 p-3 rounded-full mr-4">
            <User size={28} className="text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-slate-500 cursor-not-allowed capitalize"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold disabled:opacity-50 flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
