'use client';

import { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import ParticlesBackground from '../ParticlesBackground';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const router = useRouter();
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 🔥 UPDATED: Connected to your backend signin API
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      setIsLoading(false);
      return;
    }

    try {
      // 🔥 CHANGED: Using your new auth endpoint with rememberMe
      const response = await fetch("http://localhost:4000/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }), // 🔥 Added rememberMe
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store tokens and user data
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // 🔥 NEW: Store Remember Me preference
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        
        router.push("/dashboard");
      } else {
        setErrors({ general: result.message || "Login failed. Please check your credentials." });
      }
    } catch (error) {
      setErrors({ general: "Login failed. Please check your credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 UPDATED: Connected to your backend forgot password API
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    try {
      // 🔥 CHANGED: Using your real forgot password endpoint
      const response = await fetch("http://localhost:4000/api/v1/authRoutes/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setErrors({ general: result.message }); // Shows in green
        setEmail(''); // Clear email field
      } else {
        setErrors({ general: result.message || 'Failed to send reset email' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 relative overflow-hidden">
      <ParticlesBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 "
      >
        <Card className="bg-white/0 backdrop-blur-sm rounded-3xl mr-8 ml-8">
          <CardContent className="py-8 px-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg mb-3">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-indigo-700 mb-1">
                {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-600">
                {isForgotPassword ? 'Enter your email to reset your password' : 'Sign in to your account'}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 py-2"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full py-2" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </motion.div>

                {errors.general && <p className="text-green-500 text-xs text-center">{errors.general}</p>}

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-indigo-600 hover:text-indigo-500 text-center w-full block"
                >
                  Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 py-2"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500 py-2"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </motion.div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm cursor-pointer text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full py-2 cursor-pointer" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </motion.div>

                {errors.general && <p className="text-red-500 text-xs text-center">{errors.general}</p>}

                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

               <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="w-10 h-10 cursor-pointer rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all"
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c8.396 0 10-7.496 10-10 0-.67-.069-1.325-.189-1.961H12.545z" />
                  </svg>
                </button>
              </div>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="text-indigo-600 font-semibold hover:underline">
                    Register
                  </a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
