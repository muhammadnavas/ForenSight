import { useState } from 'react';

const GeminiTest = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const GEMINI_API_KEY = 'AIzaSyB0PG_S3DUIPYppTS790sfkxb-pZAyOaqg';
  
  // Models available for Google AI Studio keys (no billing)
  const AVAILABLE_MODELS = [
    'gemini-2.5-flash', // ✅ Works with AI Studio keys
    'gemini-1.5-flash',        // May work
    'gemini-1.5-pro-latest',   // May require billing
    'gemini-1.5-pro',          // May require billing
    'gemini-pro'               // Legacy, may work
  ];
  
  const [currentModel, setCurrentModel] = useState('gemini-1.5-flash-latest');
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent`;
  const LIST_MODELS_URL = `https://generativelanguage.googleapis.com/v1/models`;

  const testAllModels = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    let results = [];
    
    for (const model of AVAILABLE_MODELS) {
      try {
        console.log(`Testing model: ${model}`);
        const testUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
        
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Test"
              }]
            }]
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          results.push(`✅ ${model}: WORKING`);
        } else {
          results.push(`❌ ${model}: ${data.error?.message || 'Failed'}`);
        }
      } catch (err) {
        results.push(`❌ ${model}: ${err.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setResponse(`Model Test Results:\n\n${results.join('\n\n')}`);
    setLoading(false);
  };

  const listAvailableModels = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Listing available models...');
      console.log('List models URL:', LIST_MODELS_URL);

      const response = await fetch(LIST_MODELS_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        }
      });

      const data = await response.json();
      console.log('Available models response:', data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (data.models) {
        const modelList = data.models
          .map(model => `${model.name} - ${model.displayName || 'No display name'}`)
          .join('\n');
        setResponse(`Available Models:\n\n${modelList}`);
      } else {
        setResponse('No models found in response: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error listing models:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCurlEquivalent = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      // Exact match to your curl command
      const requestBody = {
        contents: [{
          parts: [{
            text: "Write a short poem about the night sky"
          }]
        }]
      };

      const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent`;

      console.log('Testing with exact curl equivalent...');
      console.log('Request URL:', testUrl);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      });

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Unexpected response format: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error testing curl equivalent:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGeminiAPI = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: "Hello! Please respond with a simple greeting to confirm the API is working."
          }]
        }]
      };

      const testUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent`;

      console.log('Testing Gemini API with key:', GEMINI_API_KEY);
      console.log('Current model:', currentModel);
      console.log('Request URL:', testUrl);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Unexpected response format: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error testing Gemini API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWithComplexPrompt = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: "Analyze this forensic scenario: A suspect's phone contains deleted messages and call logs. What are the key steps a digital forensic investigator should take to recover and analyze this data?"
          }]
        }]
      };

      const testUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Unexpected response format: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error testing Gemini API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      color: '#1e293b',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#0ea5e9'
        }}>
          🔬 Gemini API Test
        </h1>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>API Configuration</h2>
          <div style={{
            backgroundColor: '#059669',
            color: '#1e293b',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '12px',
            fontWeight: '500'
          }}>
            ✅ Google AI Studio Key (No Billing) - Using v1 API
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            <strong>API Key:</strong> {GEMINI_API_KEY.substring(0, 20)}...
          </p>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
              <strong>Select Model:</strong>
            </label>
            <select 
              value={currentModel} 
              onChange={(e) => setCurrentModel(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            <strong>Endpoint:</strong> https://generativelanguage.googleapis.com/v1/models/{currentModel}:generateContent
          </p>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            <strong>Headers:</strong> x-goog-api-key: {GEMINI_API_KEY.substring(0, 20)}...
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={listAvailableModels}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#7c3aed',
              color: '#1e293b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Loading...' : '📋 List Models'}
          </button>

          <button
            onClick={testAllModels}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#f59e0b',
              color: '#1e293b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Testing...' : '🔬 Test All Models'}
          </button>

          <button
            onClick={testCurlEquivalent}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#10b981',
              color: '#1e293b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Testing...' : '📝 Curl Test (Poem)'}
          </button>

          <button
            onClick={testGeminiAPI}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#0ea5e9',
              color: '#1e293b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Testing...' : '🧪 Simple Test'}
          </button>

          <button
            onClick={testWithComplexPrompt}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#10b981',
              color: '#1e293b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Testing...' : '🔍 Forensic Test'}
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#dc2626',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>❌ Error</h3>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div style={{
            backgroundColor: '#059669',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>✅ Success Response</h3>
            <div style={{ 
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {response}
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>📋 Test Instructions</h3>
          <ul style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
            <li><strong>Model Selector:</strong> Choose which model to test from the dropdown above</li>
            <li><strong>List Models:</strong> Query the API to see officially available models</li>
            <li><strong>Test All Models:</strong> Automatically test all common model names to find working ones</li>
            <li><strong>Curl Test (Poem):</strong> Exact equivalent of your curl command - requests a poem about night sky</li>
            <li><strong>Simple Test:</strong> Test the selected model with a basic greeting</li>
            <li><strong>Forensic Test:</strong> Test with a forensic analysis prompt</li>
            <li>Check the browser console (F12) for detailed request/response logs</li>
            <li><strong>Recommended:</strong> Start with "📝 Curl Test (Poem)" to verify exact curl equivalent</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeminiTest;
