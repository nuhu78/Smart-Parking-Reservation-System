'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Bring in the login function from our Zustand store
  const loginAction = useAuthStore((state) => state.login);

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      setLoading(true);
      console.log('Submitting login', data);

      const response = await api.post('/auth/login', data);
      console.log('Login response', response?.data);

      const token = response.data?.access_token;
      if (!token) {
        setErrorMsg('Login succeeded but no token returned');
        setLoading(false);
        return;
      }

      const profileResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('/auth/me response', profileResponse?.data);

      loginAction(profileResponse.data, token);

      if (profileResponse.data?.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }

    } catch (error) {
      console.error('Login error', error);
      // Prefer backend message, otherwise show status/text
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        setErrorMsg(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
      } else if (error.response) {
        setErrorMsg(`${error.response.status} ${error.response.statusText}`);
      } else {
        setErrorMsg(error.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-slate-800">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Welcome Back</h2>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition font-semibold"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Don't have an account? <Link href="/register" className="text-slate-800 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}