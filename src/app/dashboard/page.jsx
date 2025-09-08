// app/dashboard/page.jsx
'use client';
import React, { useState } from 'react';
import Profile from '@/componunt/profile/profile';
import Dashboard from '@/componunt/dashboard/dashboard';
import StarfieldBackground from '@/componunt/background/StarfieldBackground';
import { ArrowLeft } from 'lucide-react';

function Page() {
  const [activeTab, setActiveTab] = useState('ai');
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starfield Background */}
      <StarfieldBackground />
      
      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-purple-900/30 via-violet-900/20 to-purple-600/30"></div>
      
      {/* Content - Full Height */}
      <div className="relative z-20 h-screen">
        {activeTab === 'ai' ? (
          <Dashboard 
            user={user} 
            setUser={setUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          <div className="h-full flex flex-col">
            {/* Back to Dashboard Button */}
            <div className="p-6 border-b border-purple-300/20 bg-gradient-to-r from-purple-800/5 via-purple-700/10 to-pink-800/5 backdrop-blur-2xl">
              <button
                onClick={() => setActiveTab('ai')}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500/90 hover:to-pink-500/90 text-white rounded-2xl transition-all duration-200 shadow-xl backdrop-blur-sm transform hover:scale-105 border border-purple-400/20"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>
            
            {/* Profile Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <Profile user={user} setUser={setUser} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
