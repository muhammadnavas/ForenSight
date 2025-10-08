// Gemini AI API Configuration
export const GEMINI_CONFIG = {
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB0PG_S3DUIPYppTS790sfkxb-pZAyOaqg',
  MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  API_BASE_URL: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1/models',
  
  get API_URL() {
    return `${this.API_BASE_URL}/${this.MODEL}:generateContent`;
  }
};

// Validate API configuration
export const validateGeminiConfig = () => {
  if (!GEMINI_CONFIG.API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  
  if (!GEMINI_CONFIG.MODEL) {
    throw new Error('Gemini model is not configured. Please set VITE_GEMINI_MODEL in your .env file.');
  }
  
  return true;
};

// Common Gemini API request function
export const makeGeminiRequest = async (prompt, options = {}) => {
  validateGeminiConfig();
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  try {
    const response = await fetch(GEMINI_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_CONFIG.API_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(data)}`);
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API request failed:', error);
    throw error;
  }
};

// App configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'ForenSight',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || false
};

export default {
  GEMINI_CONFIG,
  APP_CONFIG,
  validateGeminiConfig,
  makeGeminiRequest
};