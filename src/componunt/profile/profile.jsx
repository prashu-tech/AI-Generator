// components/Profile.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Key } from 'lucide-react';

const Profile = ({ user, setUser }) => {
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('http://localhost:4000/api/v1/email/user/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUser(result.user);
      }
    };
    fetchProfile();
  }, [setUser]);

  if (!user) {
    return <div className="text-center text-purple-200/70 py-8">Loading profile...</div>;
  }

  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-purple-300/20 p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <div className="md:w-1/3">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-300/30 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-white" />
                </div>
                {user.verified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="text-1xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-purple-200/80 mb-6">Premium Member</p>

              <div className="w-full bg-purple-500/20 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>

              <div className="text-center">
                <p className="text-purple-200/70 text-sm mb-1">Member since</p>
                <p className="text-white font-medium">
                  {new Date(user.registrationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <User className="w-6 h-6 mr-2 text-purple-300" />
            Personal Information
          </h2>

          <div className="space-y-6">
            <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-300" />
                Email Address
              </h3>
              {/* 🔥 FIXED: Added responsive classes for mobile text handling */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-white break-words break-all max-w-full overflow-hidden text-ellipsis">
                  {user.email}
                </p>
                {user.verified ? (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <button className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Verify
                  </button>
                )}
              </div>
            </div>

            <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2 text-purple-300" />
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium">Last Login</p>
                    <p className="text-purple-200/70 text-sm break-words">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : 'Never logged in'}
                    </p>
                  </div>
                  <button className="text-purple-300 hover:text-purple-200 text-sm font-medium whitespace-nowrap">
                    View Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
