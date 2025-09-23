// components/sidebar/Sidebar.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Menu, X, Sparkles, User, LogOut, Settings, Trash2, Clock, MessageCircle, ChevronDown } from 'lucide-react';

// Get API base URL from environment variable
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
};

async function fetchConversationsFromDB({ after, limit = 20 }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (after) qs.set('after', after);

  try {
    const res = await fetch(`${getApiUrl()}/conversations?${qs.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      // credentials: 'include'
    });

    // Handle response
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response');
    }

    const json = await res.json();
    
    if (!json.success) {
      throw new Error(json.message || 'Failed to load conversations');
    }
    
    return json; // { success: true, conversations: [], paging: { nextCursor } }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(error.message || 'Failed to load conversations');
  }
}

async function deleteConversationFromDB(sessionId) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  try {
    const res = await fetch(`${getApiUrl()}/conversations/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    
    if (!json.success) {
      throw new Error(json.message || 'Failed to delete conversation');
    }
    
    return json;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(error.message || 'Failed to delete conversation');
  }
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  currentSessionId,
  startNewConversation,
  imageSettings,
  setImageSettings,
  activeTab,
  setActiveTab,
  handleSignOut,
  loadConversation,
  deleteConversation
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Local state for conversations
  const [list, setList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Load conversations on mount
  useEffect(() => {
    let mounted = true;
    
    const loadInitialConversations = async () => {
      if (!sidebarOpen) return; // Only load when sidebar is open
      
      setLoading(true);
      setError('');
      
      try {
        const resp = await fetchConversationsFromDB({ limit: 20 });
        
        if (!mounted) return;
        
        setList(resp.conversations || []);
        setNextCursor(resp.paging?.nextCursor || null);
      } catch (e) {
        if (!mounted) return;
        console.error('Failed to load conversations:', e);
        setError(e.message || 'Failed to load history');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialConversations();
    
    return () => {
      mounted = false;
    };
  }, [sidebarOpen]); // Load when sidebar opens

  // Load more conversations
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    setError('');
    
    try {
      const resp = await fetchConversationsFromDB({ 
        after: nextCursor, 
        limit: 20 
      });
      
      setList(prev => [...prev, ...(resp.conversations || [])]);
      setNextCursor(resp.paging?.nextCursor || null);
    } catch (e) {
      console.error('Failed to load more conversations:', e);
      setError(e.message || 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  // Delete conversation
  const handleDelete = async (sessionId, e) => {
    e?.stopPropagation?.();
    
    try {
      if (deleteConversation) {
        // Use parent-provided delete function
        await deleteConversation(sessionId, e);
      } else {
        // Call API directly
        await deleteConversationFromDB(sessionId);
      }
      
      // Remove from local list
      setList(prev => prev.filter(c => c.sessionId !== sessionId));
      
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError(err.message || 'Failed to delete');
    }
  };

  // Handle conversation selection
  const handleConversationClick = (sessionId) => {
    setShowSettings(false);
    if (loadConversation) {
      loadConversation(sessionId);
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    setShowSettings(false);
    if (startNewConversation) {
      startNewConversation();
    }
  };

  return (
    <>
      {/* Purple-Themed Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-purple-900/90 via-purple-800/90 to-purple-900/90 backdrop-blur-2xl border-r border-purple-300/20 transform transition-transform duration-300 ease-in-out shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-300/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Generator</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-purple-200 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-purple-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Generation Button */}
          <div className="p-4">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center gap-3 p-3 text-white hover:bg-purple-800/50 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Generation
            </button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-purple-200/70 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Conversations ({list.length})
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-purple-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-purple-800/50"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Settings Section */}
            {showSettings && (
              <div className="mb-4 bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 space-y-4 border border-purple-300/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/90 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </h4>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-purple-300 hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-purple-200/70 mb-2 font-medium">Model</label>
                  <select
                    value={imageSettings?.model || 'flux'}
                    onChange={(e) => setImageSettings && setImageSettings(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2 bg-purple-800/50 border border-purple-300/20 rounded-lg text-white text-sm focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                  >
                    <option value="flux">Flux (Recommended)</option>
                    <option value="turbo">Turbo (Fast)</option>
                    <option value="kontext">Kontext (Artistic)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-purple-200/70 mb-2 font-medium">Width</label>
                    <select
                      value={imageSettings?.width || 512}
                      onChange={(e) => setImageSettings && setImageSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="w-full p-2 bg-purple-800/50 border border-purple-300/20 rounded-lg text-white text-sm focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                    >
                      <option value={512}>512px</option>
                      <option value={768}>768px</option>
                      <option value={1024}>1024px</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-200/70 mb-2 font-medium">Height</label>
                    <select
                      value={imageSettings?.height || 512}
                      onChange={(e) => setImageSettings && setImageSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full p-2 bg-purple-800/50 border border-purple-300/20 rounded-lg text-white text-sm focus:border-purple-400 focus:outline-none transition-all backdrop-blur-sm"
                    >
                      <option value={512}>512px</option>
                      <option value={768}>768px</option>
                      <option value={1024}>1024px</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-purple-200/70 font-medium">Enhance Quality</label>
                    <input
                      type="checkbox"
                      checked={imageSettings?.enhance || false}
                      onChange={(e) => setImageSettings && setImageSettings(prev => ({ ...prev, enhance: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-purple-800/50 border-purple-300/20 rounded focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-purple-200/70 font-medium">Safe Mode</label>
                    <input
                      type="checkbox"
                      checked={imageSettings?.safe || false}
                      onChange={(e) => setImageSettings && setImageSettings(prev => ({ ...prev, safe: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-purple-800/50 border-purple-300/20 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-3 text-xs text-red-300 bg-red-900/20 border border-red-500/30 rounded p-2">
                {error}
              </div>
            )}

            {/* Conversation List */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-xs text-purple-300/60">Loading conversations...</p>
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-purple-300/30 mx-auto mb-4" />
                  <p className="text-sm text-purple-300/50">
                    No conversations yet.<br />
                    Start generating to see history here.
                  </p>
                </div>
              ) : (
                <>
                  {list.map((conv) => (
                    <div
                      key={conv.sessionId}
                      className={`p-3 rounded-lg transition-all duration-200 cursor-pointer group border ${
                        currentSessionId === conv.sessionId
                          ? 'bg-purple-800/40 border-purple-400/30'
                          : 'hover:bg-purple-800/30 border-transparent hover:border-purple-400/20'
                      }`}
                      onClick={() => handleConversationClick(conv.sessionId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {conv.hasImage && (
                              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                            )}
                            <span className="text-sm text-white/90 truncate font-medium">
                              {conv.title}
                            </span>
                          </div>

                          {conv.lastMessage && (
                            <p className="text-xs text-purple-300/60 truncate mb-2">
                              {conv.lastMessage.length > 50
                                ? conv.lastMessage.slice(0, 50) + '...'
                                : conv.lastMessage}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-purple-400/50">
                            <span>
                              {conv.lastActivity ? new Date(conv.lastActivity).toLocaleDateString() : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {conv.messageCount ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          className="opacity-0 group-hover:opacity-100 text-purple-300 hover:text-red-400 transition-all ml-2 p-1"
                          onClick={(e) => handleDelete(conv.sessionId, e)}
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {nextCursor && (
                    <button
                      onClick={handleLoadMore}
                      className="w-full mt-2 py-2 text-xs text-purple-200 hover:text-white hover:bg-purple-800/50 rounded-lg border border-purple-400/20 transition disabled:opacity-50"
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                          Loading...
                        </div>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Profile & Sign Out */}
          <div className="border-t border-purple-300/20 p-4">
            <div className="space-y-1">
              {activeTab && setActiveTab && (
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setActiveTab('profile');
                  }}
                  className="w-full flex items-center gap-3 p-3 text-purple-100 hover:text-white hover:bg-purple-800/50 rounded-lg transition-all duration-200 text-sm"
                >
                  <User className="w-4 h-4" />
                  <div className="text-left flex-1">
                    <span className="font-medium">Profile</span>
                    <p className="text-xs text-purple-200/60">Manage your account</p>
                  </div>
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 text-purple-200 hover:text-red-400 hover:bg-purple-800/50 rounded-lg transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <div className="text-left">
                  <span className="font-medium">Sign Out</span>
                  <p className="text-xs text-purple-300/60">End your session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-purple-900/90 hover:bg-purple-800/90 text-white rounded-lg backdrop-blur-sm shadow-xl transform hover:scale-105 border border-purple-400/20 transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-purple-900/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
