'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      setMessage('');
      
      // Call the NestJS endpoint we just built
      const response = await api.post('/auth/forgot-password', data);
      
      setMessage(response.data.message);
      
      // Wait 2 seconds so they can read the success message, 
      // then redirect them to the Reset page, passing their email in the URL
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 2000);

    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-slate-800 relative">
        
        {/* Back to Login Button */}
        <Link href="/login" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center mb-6 mt-4">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Forgot Password</h2>
          <p className="text-slate-600 text-sm mt-2">
            Enter your registered email address and we will send you a 6-digit reset code.
          </p>
        </div>
        
        {/* Success Message */}
        {message && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm text-center font-medium">
            {message} <br/><span className="text-xs">Redirecting to next step...</span>
          </div>
        )}

        {/* Error Message */}
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
              disabled={isLoading || message}
              {...register('email', { required: 'Email is required' })}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800 disabled:bg-slate-100"
              placeholder="e.g., student@university.edu"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || message}
            className="w-full bg-slate-800 text-white p-2 rounded hover:bg-slate-700 transition font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
}