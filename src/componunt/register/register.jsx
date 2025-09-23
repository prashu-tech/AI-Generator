"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import ParticlesBackground from "../ParticlesBackground";
import { useRouter } from "next/navigation";

const RegistrationStep = {
  INITIAL: 0,
  EMAIL_VERIFICATION: 1,
  OTP_VERIFICATION: 3,
  COMPLETE_PROFILE: 4,
};

export default function RegisterPage() {
  const [step, setStep] = useState(RegistrationStep.INITIAL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpConfirmation, setOtpConfirmation] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tempToken, setTempToken] = useState("");

  const router = useRouter();

  // 🔥 FIXED: Centralized URL selection function
  const getBaseURL = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:4000'
      : 'https://ai-generator-backend-rlc5.onrender.com';
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 1. Request OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const URL = getBaseURL(); // 🔥 FIXED: Use centralized function
    const fullURL = `${URL}/api/v1/email/initiateEmailVerification`;
    
    console.log('🔥 Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      URL: URL,
      fullURL: fullURL
    });

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔥 Making email verification request to:', fullURL);
      
      const response = await fetch(fullURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email }),
      });

      console.log('🔥 Email verification response status:', response.status);
      const result = await response.json();
      console.log('🔥 Email verification result:', result);

      if (response.ok && result.success) {
        localStorage.setItem("userEmail", email);
        setStep(RegistrationStep.OTP_VERIFICATION);
      } else {
        setErrors({ email: result.message });
      }
    } catch (error) {
      console.error('🔥 Email verification error:', error);
      setErrors({ email: "Failed to send OTP" });
    } finally {
      setIsLoading(false);
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrors({});

    const URL = getBaseURL(); // 🔥 FIXED: Use centralized function
    const userEmail = localStorage.getItem("userEmail");

    try {
      console.log('🔥 Making OTP verification request to:', `${URL}/api/v1/email/verifyEmailOTP`);
      
      const response = await fetch(`${URL}/api/v1/email/verifyEmailOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otp,
        }),
      });

      console.log('🔥 OTP verification response status:', response.status);
      const result = await response.json();
      console.log('🔥 OTP verification result:', result);

      if (response.ok && result.success) {
        console.log('🔥 OTP Verify Response:', result);
        const tokenFromResponse = result.data.tempToken;
        console.log('🔥 Extracted tempToken:', tokenFromResponse);
        setTempToken(tokenFromResponse);
        localStorage.setItem("tempToken", tokenFromResponse);
        localStorage.setItem("userEmail", userEmail);
        setStep(RegistrationStep.COMPLETE_PROFILE);
      } else {
        setErrors({ otp: result.message || "Invalid OTP" });
      }
    } catch (error) {
      console.error('🔥 OTP verification error:', error);
      setErrors({ otp: "Failed to verify OTP" });
    } finally {
      setIsVerifying(false);
      setOtp("");
    }
  };

  // 3. Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!username) {
      setErrors({ username: "Name is required" });
      return;
    }

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    const URL = getBaseURL(); // 🔥 FIXED: Use centralized function
    const tokenToSend = tempToken || localStorage.getItem("tempToken");
    
    if (!tokenToSend) {
      setErrors({ general: "Missing authentication token. Please verify OTP again." });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔥 Making complete registration request to:', `${URL}/api/v1/email/completeRegistration`);
      
      const response = await fetch(`${URL}/api/v1/email/completeRegistration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${tokenToSend}`,
        },
        body: JSON.stringify({
          email: localStorage.getItem("userEmail"),
          username,
          password,
          confirmPassword,
        }),
      });

      console.log('🔥 Complete registration response status:', response.status);
      const result = await response.json();
      console.log('🔥 Complete registration result:', result);

      if (response.ok && result.success) {
        console.log('🔥 Registration successful, redirecting to signin...');
        
        // 🔥 FIXED: Add delay and force redirect like in login
        setTimeout(() => {
          router.push("/signin");
          // Backup redirect
          window.location.href = "/signin";
        }, 100);
      } else {
        setErrors({ general: result.message || "Registration failed" });
      }
    } catch (error) {
      console.error('🔥 Complete registration error:', error);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInitialStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center text-gray-700">
        Register with
      </h3>

      <div className="flex items-center mb-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500"></span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="space-y-3">
        <motion.div whileHover={{ scale: 1.01 }}>
          <Button
            onClick={() => setStep(RegistrationStep.EMAIL_VERIFICATION)}
            variant="outline"
            className="w-full cursor-pointer py-2 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Continue with Email
          </Button>
        </motion.div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <a
          href="/signin"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );

  const renderEmailVerificationStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">Verify your email</h3>
        <p className="text-sm text-[#9df68b] mt-1">
          We'll send a verification code to your email
        </p>
      </div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Input
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus:ring-indigo-500 py-2"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="w-full py-2" disabled={isLoading}>
          {isLoading ? "Sending OTP..." : "Send Verification Code"}
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={() => setStep(RegistrationStep.INITIAL)}
        className="text-sm text-indigo-600 hover:text-indigo-500 text-center w-full block"
      >
        Back to registration options
      </button>
    </form>
  );

  const renderOtpVerificationStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">Enter OTP</h3>
        <p className="text-sm text-gray-500 mt-1">
          Check your email for the verification code
        </p>
      </div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="focus:ring-indigo-500 py-2"
        />
        {errors.otp && (
          <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="w-full py-2" disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={() => setStep(RegistrationStep.EMAIL_VERIFICATION)}
        className="text-sm text-indigo-600 hover:text-indigo-500 text-center w-full block"
      >
        Back to email verification
      </button>
    </form>
  );

  const renderCompleteProfileStep = () => (
    <form onSubmit={handleCompleteRegistration} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">
          Complete your profile
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Just a few more details to get started
        </p>
      </div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Input
          placeholder="Full Name"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="focus:ring-indigo-500 py-2"
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username}</p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus:ring-indigo-500 py-2"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="focus:ring-indigo-500 py-2"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="w-full py-2" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Complete Registration"}
        </Button>
      </motion.div>

      {errors.general && (
        <p className="text-red-500 text-xs text-center">{errors.general}</p>
      )}
    </form>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case RegistrationStep.INITIAL:
        return renderInitialStep();
      case RegistrationStep.EMAIL_VERIFICATION:
        return renderEmailVerificationStep();
      case RegistrationStep.OTP_VERIFICATION:
        return renderOtpVerificationStep();
      case RegistrationStep.COMPLETE_PROFILE:
        return renderCompleteProfileStep();
      default:
        return renderInitialStep();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 relative overflow-hidden">
      <ParticlesBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/0 backdrop-blur-sm rounded-3xl mr-7 ml-7">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-indigo-700 mb-1">
                {step === RegistrationStep.COMPLETE_PROFILE
                  ? "Complete Registration"
                  : "Create Account"}
              </h2>
              {step === RegistrationStep.INITIAL && (
                <p className="text-sm text-gray-600">
                  Join our community today
                </p>
              )}
            </div>

            {renderCurrentStep()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
