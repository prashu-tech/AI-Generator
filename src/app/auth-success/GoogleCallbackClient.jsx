"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const processGoogleCallback = () => {
      console.log('🔥 Processing Google callback');
      
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const userParam = searchParams.get("user");

      console.log('🔥 Callback params:', {
        accessToken: accessToken ? 'PRESENT' : 'MISSING',
        refreshToken: refreshToken ? 'PRESENT' : 'MISSING',
        user: userParam ? 'PRESENT' : 'MISSING'
      });

      if (accessToken) {
        try {
          // Store tokens
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          
          // Parse and store user data
          if (userParam) {
            const user = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem("user", JSON.stringify(user));
            console.log('🔥 User data stored:', user);
          }

          setStatus('Success! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
          
        } catch (error) {
          console.error('🔥 Error processing callback:', error);
          setStatus('Error processing login. Redirecting...');
          setTimeout(() => {
            router.push("/signin?error=processing_failed");
          }, 2000);
        }
      } else {
        console.log('🔥 No access token - redirecting to signin');
        setStatus('Login failed. Redirecting...');
        setTimeout(() => {
          router.push("/signin?error=google_failed");
        }, 2000);
      }
    };

    processGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl">{status}</p>
      </div>
    </div>
  );
}
