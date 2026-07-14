'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  // Watch the newPassword field so we can make sure confirmPassword matches
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      
      // Combine the form data with the email from the URL
      const payload = {
        email: emailFromUrl,
        code: data.code,
        newPassword: data.newPassword
      };

      const response = await api.post('/auth/reset-password', payload);
      setSuccessMsg(response.data.message);
      
      // Send them back to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // If there is no email in the URL, someone just typed /reset-password into their browser.
  // We should tell them to go back to the start.
  if (!emailFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <p className="text-slate-600 mb-4">You are missing an email address to reset.</p>
          <button onClick={() => router.push('/forgot-password')} className="bg-slate-800 text-white px-4 py-2 rounded">
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-slate-800 relative">
        
        <Link href="/login" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center mb-6 mt-4">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} className="text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Set New Password</h2>
          <p className="text-slate-600 text-sm mt-2">
            Enter the 6-digit code sent to <br/> <strong className="text-slate-800">{emailFromUrl}</strong>
          </p>
        </div>
        
        {successMsg && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm text-center font-medium">
            {successMsg} <br/><span className="text-xs">Redirecting to login...</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* If successful, hide the form to prevent double submission */}
        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">6-Digit Reset Code</label>
              <input 
                type="text"
                maxLength="6"
                placeholder="123456"
                {...register('code', { 
                  required: 'Code is required',
                  minLength: { value: 6, message: 'Code must be 6 digits' }
                })}
                className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800 text-center tracking-widest text-lg font-bold"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input 
                type="password"
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
                className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input 
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-800 text-white p-2 rounded hover:bg-slate-700 transition font-semibold mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}