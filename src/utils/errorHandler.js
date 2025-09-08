// src/utils/errorHandler.js (FRONTEND FILE)

// Map common API errors to user-friendly messages
export const ERROR_MESSAGES = {
  // Network errors
  'Network Error': 'Please check your internet connection and try again.',
  'Failed to fetch': 'Unable to connect to server. Please try again later.',
  
  // Authentication errors
  401: 'Your session has expired. Please sign in again.',
  403: 'You don\'t have permission to perform this action.',
  
  // Server errors
  500: 'Something went wrong on our end. Please try again in a few minutes.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service is under maintenance. Please try again later.',
  
  // Client errors
  400: 'Invalid request. Please check your input and try again.',
  404: 'The requested resource was not found.',
  429: 'Too many requests. Please wait a moment and try again.',
  
  // Generation specific errors
  'Generation failed': 'Failed to generate image. Please try a different prompt.',
  'AI service busy': 'AI service is currently busy. Please try again in a few moments.',
};

// Get user-friendly error message
export const getUserFriendlyError = (error) => {
  console.error('Original error:', error);
  
  // Handle different error types
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }
  
  if (error?.response?.status) {
    const status = error.response.status;
    if (ERROR_MESSAGES[status]) {
      return ERROR_MESSAGES[status];
    }
  }
  
  if (error?.message) {
    // Check if message matches our predefined errors
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message;
      }
    }
    return error.message;
  }
  
  // Default fallback
  return 'Something unexpected happened. Please try again.';
};

// Format API errors
export const handleApiError = (error, customMessage = null) => {
  const userMessage = customMessage || getUserFriendlyError(error);
  
  return {
    message: userMessage,
    type: 'error',
    timestamp: new Date().toLocaleTimeString()
  };
};
