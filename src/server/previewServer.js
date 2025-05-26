
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// In-memory storage for preview code (use Redis in production)
const previewStorage = new Map();

// CORS configuration for localhost development
app.use(cors({
  origin: ['http://localhost:4173', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Generate preview endpoint
app.post('/api/generate-preview', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a string'
      });
    }

    // Basic validation
    if (code.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Code is too long (max 50KB)'
      });
    }

    // Generate unique ID
    const id = uuidv4();
    
    // Store code with expiration (cleanup after 1 hour)
    previewStorage.set(id, {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
    });

    // Cleanup expired entries
    cleanupExpiredPreviews();

    const previewUrl = `http://localhost:${PORT}/preview/${id}`;
    
    res.json({
      id,
      previewUrl,
      success: true
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Serve preview HTML
app.get('/preview/:id', (req, res) => {
  try {
    const { id } = req.params;
    const previewData = previewStorage.get(id);
    
    if (!previewData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Preview Not Found</h1>
            <p>The preview you're looking for has expired or doesn't exist.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if expired
    if (Date.now() > previewData.expiresAt) {
      previewStorage.delete(id);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview Expired</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Preview Expired</h1>
            <p>This preview has expired. Please generate a new one.</p>
          </div>
        </body>
        </html>
      `);
    }

    const html = generatePreviewHTML(previewData.code);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Preview serving error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Preview Error</h1>
          <p>An error occurred while rendering the preview.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Generate HTML template for React preview
function generatePreviewHTML(code) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Live Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
      background-color: #ffffff;
    }
    #root {
      min-height: 100vh;
    }
    .error-boundary {
      padding: 20px;
      border: 2px solid #dc3545;
      border-radius: 8px;
      background-color: #f8d7da;
      color: #721c24;
      margin: 20px;
    }
    .error-boundary h2 {
      margin-top: 0;
      color: #721c24;
    }
    .error-boundary pre {
      background-color: #f5c6cb;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo, useRef } = React;
    
    // Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true };
      }
      
      componentDidCatch(error, errorInfo) {
        this.setState({
          error: error,
          errorInfo: errorInfo
        });
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary">
              <h2>Something went wrong in your React component</h2>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>Error Details</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            </div>
          );
        }
        return this.props.children;
      }
    }
    
    try {
      // User's component code
      ${code}
      
      // Auto-detect component name
      let ComponentToRender = App || Component || Main;
      
      if (!ComponentToRender) {
        throw new Error('No component found. Please export a component named App, Component, or Main as default.');
      }
      
      // Render the component
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null,
          React.createElement(ComponentToRender)
        )
      );
      
    } catch (error) {
      console.error('Compilation Error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h2>Compilation Error</h2>
          <p>There was an error compiling your React component:</p>
          <pre>\${error.message}</pre>
          <p>Please check your code and try again.</p>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
}

// Cleanup function for expired previews
function cleanupExpiredPreviews() {
  const now = Date.now();
  for (const [id, data] of previewStorage.entries()) {
    if (now > data.expiresAt) {
      previewStorage.delete(id);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredPreviews, 10 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activepreviews: previewStorage.size,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(\`Preview server running on http://localhost:\${PORT}\`);
  console.log('CORS enabled for localhost development');
});

module.exports = app;
