'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      // Calls http://localhost:3000/auth/register
      await api.post('/auth/register', data);
      router.push('/login'); // Redirect to login on success
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-green-600">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Create an Account</h2>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-800 text-white p-2 rounded hover:bg-slate-700 transition font-semibold"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account? <Link href="/login" className="text-green-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}