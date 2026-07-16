'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setSuccessMsg('Password changed successfully!');
      reset();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMsg(
        Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} className="text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
          <p className="text-slate-600 text-sm mt-2">Update your password while logged in</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              {...register('oldPassword', { required: 'Current password is required' })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            />
            {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition font-semibold mt-4 disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
