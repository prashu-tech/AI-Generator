// components/dashboard/dashboard.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Download, Copy, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../sidebar/sidebar.jsx';
// 🔥 NEW: Error handling imports
import { ToastManager } from '../ui/toast.jsx';
import { useToast } from '../../hooks/useToast.js';
import { handleApiError, getUserFriendlyError } from '../../utils/errorHandler.js';

// 🔥 EXISTING: Interactive 3D Rotating Logo Component (unchanged)
const Interactive3DRotatingLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const logoRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!logoRef.current) return;

    const rect = logoRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Convert to rotation angles (adjust divisor for sensitivity)
    const rotateY = (mouseX / rect.width) * 75; // Max 30 degrees
    const rotateX = -(mouseY / rect.height) * 75; // Max 30 degrees (negative for natural feel)

    setTransform({
      rotateX,
      rotateY,
      scale: 1.3
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div className="relative inline-block mb-6 cursor-pointer">
      <div
        ref={logoRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-4xl flex items-center justify-center shadow-2xl overflow-hidden"
        style={{
          transform: `perspective(600px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s ease-out, box-shadow 0.3s ease-out',
          boxShadow: isHovered 
            ? `0 30px 60px rgba(168, 85, 247, 0.6), 0 0 100px rgba(236, 72, 153, 0.5), inset 0 2px 0 rgba(255,255,255,0.4)` 
            : '0 15px 35px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* Inner Gradient Overlay for 3D Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-black/30"></div>
        
        {/* Animated Background Pattern */}
        {isHovered && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-purple-500/60 to-pink-500/60"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
        )}
        
        {/* Main Sparkles Icon */}
        <Sparkles 
          className="w-12 h-12 text-white relative z-20" 
          style={{
            transform: `translateZ(40px) ${isHovered ? 'rotateZ(15deg) scale(1.1)' : 'rotateZ(0deg) scale(1)'}`,
            filter: isHovered ? 'brightness(1.5) drop-shadow(0 0 15px rgba(255,255,255,1)) drop-shadow(0 0 30px rgba(168, 85, 247,0.8))' : 'brightness(1)',
            transition: 'all 0.3s ease-out'
          }}
        />

        {/* 3D Depth Layers */}
        <div 
          className="absolute inset-1 bg-gradient-to-br from-purple-500/70 to-pink-500/70 rounded-3xl"
          style={{
            transform: 'translateZ(-12px)',
            transformStyle: 'preserve-3d'
          }}
        ></div>
        <div 
          className="absolute inset-3 bg-gradient-to-br from-purple-700/30 to-pink-700/30 rounded-3xl"
          style={{
            transform: 'translateZ(-36px)',
            transformStyle: 'preserve-3d'
          }}
        ></div>
      </div>

      {/* Dynamic Floating Sparkles */}
      {isHovered && (
        <>
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * 2 * Math.PI;
            const radius = 80 + Math.sin(Date.now() * 0.002 + i) * 15;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  background: i % 4 === 0 ? '#ffffff' : i % 4 === 1 ? '#f472b6' : i % 4 === 2 ? '#a855f7' : '#ec4899',
                  animation: `sparkle-orbit-${i} 2.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                  boxShadow: '0 0 8px currentColor, 0 0 16px currentColor'
                }}
              ></div>
            );
          })}
        </>
      )}

      {/* Enhanced CSS Keyframes */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        ${[...Array(16)].map((_, i) => `
          @keyframes sparkle-orbit-${i} {
            0%, 100% {
              opacity: 0;
              transform: scale(0) rotate(0deg) translateY(0px);
            }
            25% {
              opacity: 1;
              transform: scale(1) rotate(90deg) translateY(-8px);
            }
            75% {
              opacity: 1;
              transform: scale(1.5) rotate(270deg) translateY(8px);
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

const Dashboard = ({ user, setUser, activeTab, setActiveTab }) => {
  const router = useRouter();
  // 🔥 NEW: Toast functionality
  const { toasts, removeToast, showError, showSuccess, showWarning } = useToast();
  
  // 🔥 EXISTING: All your existing state (unchanged)
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageSettings, setImageSettings] = useState({
    model: 'flux',
    width: 1024,
    height: 1024,
    enhance: true,
    safe: true
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognition = useRef(null);

    // To this:
// Temporary hardcoded fix for testing
const URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;

// Keep your debugging
console.log('Environment variables:', {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  URL: URL
});


  // 🔥 EXISTING: Sign out handler (unchanged)
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tempToken');
    if (setUser) setUser(null);
    router.push('/signin');
  };

  // 🔥 EXISTING: Auto scroll to bottom (unchanged)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 EXISTING: Initialize speech recognition (unchanged)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // 🔥 ENHANCED: Load conversations with error handling
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No accessToken found');
        return;
      }

      const response = await fetch(`${URL}/api/v1/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('Token expired, redirecting to sign in');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 🔥 NEW: User-friendly error message
        showError('Your session has expired. Please sign in again.');
        router.push('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Conversations loaded:', data);
      
      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        throw new Error(data.message || 'Failed to load conversations');
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      // 🔥 NEW: User-friendly error notification
      showError('Unable to load conversation history. Please refresh the page.');
    }
  };

  // 🔥 ENHANCED: Load specific conversation messages with error handling
  const loadConversation = async (sessionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      console.log('🔄 Loading conversation:', sessionId);

      const response = await fetch(`${URL}/api/v1/conversations/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Conversation loaded:', data.conversation);
          
          const formattedMessages = data.conversation.messages.map((msg, index) => ({
            id: `${sessionId}-${index}`,
            type: msg.role,
            content: msg.content,
            imageUrl: msg.imageUrl,
            timestamp: new Date(msg.timestamp).toLocaleTimeString()
          }));

          setMessages(formattedMessages);
          setCurrentSessionId(sessionId);
          setSidebarOpen(false);
        }
      } else {
        console.error('❌ Failed to load conversation:', response.status);
        // 🔥 NEW: User-friendly error message
        showError('Unable to load this conversation. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      // 🔥 NEW: User-friendly error message
      showError('Failed to load conversation. Please check your connection.');
    }
  };

  // 🔥 ENHANCED: Create new conversation with error handling
  const createConversation = async (prompt) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      console.log('🔄 Creating new conversation with prompt:', prompt);

      const response = await fetch(`${URL}/api/v1/conversations/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Conversation created:', data.sessionId);
          setCurrentSessionId(data.sessionId);
          await loadConversations();
          return data.sessionId;
        }
      } else {
        console.error('❌ Failed to create conversation:', response.status);
        // 🔥 NEW: User-friendly error message
        showError('Unable to start new conversation. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      // 🔥 NEW: User-friendly error message
      showError('Failed to create conversation. Please check your connection.');
    }
    return null;
  };

  // 🔥 ENHANCED: Add message to conversation with error handling
  const addMessageToConversation = async (sessionId, role, content, imageUrl = null) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      console.log('🔄 Adding message to conversation:', { sessionId, role, content: content.slice(0, 50) });

      const response = await fetch(`${URL}/api/v1/conversations/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, content, imageUrl })
      });

      if (response.ok) {
        console.log('✅ Message added to conversation');
        await loadConversations();
      } else {
        console.error('❌ Failed to add message:', response.status);
        // 🔥 NEW: Silent error handling (don't show toast for this)
        console.warn('Message not saved to conversation history');
      }
    } catch (error) {
      console.error('❌ Error adding message to conversation:', error);
      // 🔥 NEW: Silent error handling
      console.warn('Message not saved to conversation history');
    }
  };

  // 🔥 ENHANCED: Delete conversation with error handling
  const deleteConversation = async (sessionId, event) => {
    if (event) event.stopPropagation();
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      console.log('🔄 Deleting conversation:', sessionId);

      const response = await fetch(`${URL}/api/v1/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Conversation deleted');
        // 🔥 NEW: Success message
        showSuccess('Conversation deleted successfully');
        
        if (sessionId === currentSessionId) {
          setMessages([]);
          setCurrentSessionId(null);
        }
        
        await loadConversations();
      } else {
        console.error('❌ Failed to delete conversation:', response.status);
        // 🔥 NEW: User-friendly error message
        showError('Unable to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      // 🔥 NEW: User-friendly error message
      showError('Failed to delete conversation. Please check your connection.');
    }
  };

  // 🔥 EXISTING: Start new conversation (unchanged)
  const startNewConversation = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setSidebarOpen(false);
    console.log('🔄 Started new conversation');
  };

  // 🔥 EXISTING: Handle voice input (unchanged)
  const handleVoiceInput = () => {
    if (recognition.current) {
      if (isListening) {
        recognition.current.stop();
        setIsListening(false);
      } else {
        recognition.current.start();
        setIsListening(true);
      }
    }
  };

  // 🔥 ENHANCED: Generate image with comprehensive error handling
  const generateImage = async (prompt) => {
    setIsGenerating(true);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('AccessToken check:', { hasToken: !!token, token: token?.substring(0, 20) + '...' });
      
      if (!token) {
        throw new Error('Please sign in to generate images');
      }

      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createConversation(prompt);
        if (!sessionId) {
          throw new Error('Failed to create conversation');
        }
      } else {
        await addMessageToConversation(sessionId, 'user', prompt);
      }

      console.log('Generating image with backend:', `${URL}/api/v1/dashboard/generate`);
      
      const response = await fetch(`${URL}/api/v1/dashboard/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          model: imageSettings.model,
          width: imageSettings.width,
          height: imageSettings.height,
          enhance: imageSettings.enhance,
          safe: imageSettings.safe
        })
      });

      console.log('Response status:', response.status);
      
      // 🔥 ENHANCED: Better HTTP status handling
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        showError('Your session has expired. Please sign in again.');
        router.push('/signin');
        return;
      }
      
      if (response.status === 429) {
        showWarning('You\'re generating images too quickly. Please wait a moment and try again.');
        return;
      }
      
      if (response.status === 503) {
        showError('AI service is temporarily under maintenance. Please try again in a few minutes.');
        return;
      }
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Server error (${response.status})`;
        } catch {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          if (errorText.includes('502') || errorText.includes('Bad Gateway')) {
            errorMessage = 'AI service is temporarily busy. Please try again in a few moments.';
          } else {
            errorMessage = `Generation failed: ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Generation response:', data);
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: prompt,
          imageUrl: data.imageUrl,
          timestamp: new Date().toLocaleTimeString(),
          historyId: data.historyId
        };
        
        setMessages(prev => [...prev, aiMessage]);

        await addMessageToConversation(sessionId, 'ai', prompt, data.imageUrl);
        
        // 🔥 NEW: Success notification
        showSuccess('Image generated successfully!');
        
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      
      // 🔥 ENHANCED: User-friendly error handling
      const friendlyError = getUserFriendlyError(error);
      showError(friendlyError);
      
      let errorMessage = error.message;
      if (errorMessage.includes('502') || errorMessage.includes('temporarily busy')) {
        errorMessage += '\n\n💡 Tips:\n• Try a shorter, simpler prompt\n• Wait a moment and try again\n• The AI service may be experiencing high traffic';
      }
      
      const aiErrorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: friendlyError, // 🔥 NEW: Use friendly error in chat too
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 🔥 EXISTING: Handle submit (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const prompt = inputText.trim();
    setInputText('');
    await generateImage(prompt);
  };

  // 🔥 EXISTING: Copy to clipboard (unchanged)
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // 🔥 ENHANCED: Download image with error handling
  const downloadImage = async (imageUrl, prompt) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${prompt.slice(0, 30)}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      // 🔥 NEW: Success message
      showSuccess('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      // 🔥 NEW: Error message
      showError('Failed to download image. Please try again.');
    }
  };

  // 🔥 EXISTING: MessageBubble component (unchanged)
  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
        <div className={`max-w-4xl ${isUser ? 'w-auto' : 'w-full'}`}>
          {!isUser && (
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium">AI Image Generator</span>
            </div>
          )}
          
          <div className={`rounded-3xl p-6 backdrop-blur-xl border shadow-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white ml-16 border-purple-300/30 shadow-purple-500/20' 
              : isError 
                ? 'bg-gradient-to-br from-red-900/10 to-red-800/10 text-red-200 border-red-400/20 shadow-red-500/10'
                : 'bg-gradient-to-br from-purple-900/10 via-purple-800/10 to-pink-900/10 text-white border-purple-300/20 shadow-purple-500/10'
          }`}>
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
            
            {message.imageUrl && (
              <div className="mt-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={message.imageUrl}
                    alt={message.content}
                    className="w-full max-w-lg rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
                    onLoad={() => console.log('✅ Image loaded successfully:', message.imageUrl)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', message.imageUrl);
                      console.error('Error details:', e);
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => downloadImage(message.imageUrl, message.content)}
                      className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.imageUrl)}
                      className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 text-xs opacity-60">
              <span>{message.timestamp}</span>
              {!isUser && !isError && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="hover:text-purple-200 transition-colors p-1 rounded hover:bg-white/10"
                    title="Copy prompt"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 🔥 NEW: Toast Manager */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <div className="flex h-screen">
        {/* 🔥 EXISTING: Use Sidebar Component with conversation props (unchanged) */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          conversations={conversations}
          currentSessionId={currentSessionId}
          startNewConversation={startNewConversation}
          imageSettings={imageSettings}
          setImageSettings={setImageSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSignOut={handleSignOut}
          loadConversation={loadConversation}
          deleteConversation={deleteConversation}
        />

        {/* 🔥 EXISTING: Main Content Area (unchanged) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Display current conversation title if exists */}
            {currentSessionId && messages.length > 0 && (
              <div className="mb-6 text-center">
                <h2 className="text-xl text-white/80 font-medium">
                  {conversations.find(c => c.sessionId === currentSessionId)?.title || 'Conversation'}
                </h2>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-20 md:mt-0">
                {/* 🔥 EXISTING: Interactive 3D Rotating Logo (unchanged) */}
                <Interactive3DRotatingLogo />
                
                <h2 className="text-3xl font-bold text-white mb-3">Create Extraordinary Images</h2>
                <p className="text-white/70 mb-12 max-w-md text-lg">
                  Transform your imagination into stunning visuals with our advanced AI technology.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
                  <button
                    onClick={() => setInputText("A magical forest with glowing mushrooms and fairy lights")}
                    className="p-6 bg-gradient-to-br from-purple-900/10 to-purple-800/10 hover:from-purple-800/20 hover:to-purple-700/20 border border-purple-300/20 rounded-2xl text-left transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:border-purple-400/30"
                  >
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      🌟 Fantasy
                    </h3>
                    <p className="text-sm text-white/70">A magical forest with glowing mushrooms</p>
                  </button>
                  <button
                    onClick={() => setInputText("A cyberpunk cityscape with neon lights reflecting in rain")}
                    className="p-6 bg-gradient-to-br from-pink-900/10 to-pink-800/10 hover:from-pink-800/20 hover:to-pink-700/20 border border-pink-300/20 rounded-2xl text-left transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:border-pink-400/30"
                  >
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      🏙️ Cyberpunk
                    </h3>
                    <p className="text-sm text-white/70">A cyberpunk cityscape with neon lights</p>
                  </button>
                  <button
                    onClick={() => setInputText("A serene mountain lake at sunrise with mist")}
                    className="p-6 bg-gradient-to-br from-blue-900/10 to-blue-800/10 hover:from-blue-800/20 hover:to-blue-700/20 border border-blue-300/20 rounded-2xl text-left transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:border-blue-400/30"
                  >
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      🏔️ Nature
                    </h3>
                    <p className="text-sm text-white/70">A serene mountain lake at sunrise</p>
                  </button>
                  <button
                    onClick={() => setInputText("An abstract geometric pattern with vibrant colors")}
                    className="p-6 bg-gradient-to-br from-green-900/10 to-green-800/10 hover:from-green-800/20 hover:to-green-700/20 border border-green-300/20 rounded-2xl text-left transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:border-green-400/30"
                  >
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      🎨 Abstract
                    </h3>
                    <p className="text-sm text-white/70">An abstract geometric pattern</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isGenerating && (
                  <div className="flex justify-start mb-8">
                    <div className="max-w-4xl w-full">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <Sparkles className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <span className="text-white/90 text-sm font-medium">AI Image Generator</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/10 via-purple-800/10 to-pink-900/10 border border-purple-300/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-white/90 font-medium">Creating your masterpiece...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 🔥 EXISTING: Input Area (unchanged) */}
          <div className="border-t border-purple-300/10 p-6 bg-gradient-to-r from-purple-800/5 via-purple-700/10 to-pink-800/5">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="w-full p-5 bg-white/5 border border-purple-300/20 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-transparent backdrop-blur-xl shadow-xl transition-all font-medium"
                    rows="1"
                    style={{ minHeight: '60px', maxHeight: '200px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-4 rounded-2xl border transition-all duration-200 backdrop-blur-sm shadow-xl transform hover:scale-105 ${
                    isListening 
                      ? 'bg-red-600/80 border-red-400/40 text-white shadow-red-500/20' 
                      : 'bg-white/5 border-purple-300/20 text-purple-200 hover:bg-white/10 hover:border-purple-300/30'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isGenerating}
                  className="p-4 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500/90 hover:to-pink-500/90 disabled:from-purple-800/40 disabled:to-purple-800/40 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-xl backdrop-blur-sm transform hover:scale-105 disabled:transform-none border border-purple-400/20"
                  title="Generate image"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 text-xs text-white/50 text-center font-medium">
                Press Enter to send • Shift + Enter for new line • Use voice for hands-free input
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );  
};

export default Dashboard;
