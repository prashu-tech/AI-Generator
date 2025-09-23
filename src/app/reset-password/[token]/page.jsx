'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '../../../componunt/ui/input';
import { Button } from '../../../componunt/ui/button';
import { Card, CardContent } from '../../../componunt/ui/card';
import ParticlesBackground from '@/componunt/ParticlesBackground';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

const handleResetPassword = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrors({});

  // Validate passwords
  const passwordError = validatePassword(password);
  if (passwordError) {
    setErrors({ password: passwordError });
    setIsLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setErrors({ confirmPassword: 'Passwords do not match' });
    setIsLoading(false);
    return;
  }

  // 🔥 ADD: Same URL logic as other pages
  const getBaseURL = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:4000'
      : 'https://ai-generator-backend-rlc5.onrender.com';
  };

  const BASE_URL = getBaseURL();
  const fullURL = `${BASE_URL}/api/v1/authRoutes/reset-password/${token}`;

  console.log('🔥 Reset password request:', {
    token: token,
    fullURL: fullURL,
    password: password ? 'PROVIDED' : 'EMPTY',
    confirmPassword: confirmPassword ? 'PROVIDED' : 'EMPTY'
  });

  try {
    const requestBody = {
      password,
      confirmPassword,
    };

    console.log('🔥 Request body:', requestBody);

    const response = await fetch(fullURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // 🔥 ADD: Accept header
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔥 Response status:', response.status);
    console.log('🔥 Response ok:', response.ok);

    const responseText = await response.text();
    console.log('🔥 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('🔥 Parsed result:', result);
    } catch (parseError) {
      console.error('🔥 JSON parse error:', parseError);
      setErrors({ general: 'Invalid response from server' });
      setIsLoading(false);
      return;
    }

    if (response.ok && result.success) {
      console.log('🔥 Password reset successful!');
      setIsSuccess(true);
      // Redirect to sign-in page after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } else {
      console.log('🔥 Password reset failed:', result);
      if (response.status === 400) {
        setErrors({ general: result.message || 'Invalid or expired reset token' });
        setTokenValid(false);
      } else {
        setErrors({ general: result.message || 'Failed to reset password' });
      }
    }
  } catch (error) {
    console.error('🔥 Reset password error:', error);
    setErrors({ general: 'Failed to reset password. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};


  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 relative overflow-hidden">
        <ParticlesBackground />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="bg-white/10 backdrop-blur-xl rounded-3xl mx-8 shadow-2xl border border-white/20">
            <CardContent className="py-12 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center shadow-xl mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Password Reset Successful!
                </h2>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
                <p className="text-white/60 text-sm">
                  Redirecting to signin page in a few seconds...
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Invalid token screen
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 relative overflow-hidden">
        <ParticlesBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="bg-white/10 backdrop-blur-xl rounded-3xl mx-8 shadow-2xl border border-white/20">
            <CardContent className="py-12 px-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center shadow-xl mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              
              <Button
                onClick={() => router.push('/signin')}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Back to sign-in page
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 relative overflow-hidden">
      <ParticlesBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/10 backdrop-blur-xl rounded-3xl mx-8 shadow-2xl border border-white/20">
          <CardContent className="py-8 px-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m0 0a2 2 0 102 2M9 5a2 2 0 012 2v8a2 2 0 01-2 2M9 5a2 2 0 00-2 2v8a2 2 0 002 2m0-4h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Your Password
              </h2>
              <p className="text-white/70 text-sm">
                Enter your new password below to complete the reset process
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <motion.div whileHover={{ scale: 1.01 }}>
                <Input
                  placeholder="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 py-3 bg-white/5 border-white/20 text-white placeholder-white/50"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-2 ml-1">{errors.password}</p>
                )}
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }}>
                <Input
                  placeholder="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-indigo-500 py-3 bg-white/5 border-white/20 text-white placeholder-white/50"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-2 ml-1">{errors.confirmPassword}</p>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </motion.div>

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-red-400 text-sm bg-red-100/10 py-2 px-4 rounded-lg">
                    {errors.general}
                  </p>
                </motion.div>
              )}
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/signin')}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                ← Back to sign-in page
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
