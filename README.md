# MCP Vertx Backend Tester Frontend

A comprehensive frontend application for testing your MCP Vertx backend server. This application provides a user-friendly interface to test all backend endpoints, chat functionality, and API integrations.

## Features

### 🚀 **Chat Interface**
- **Real-time streaming chat** with all agent types
- **Multiple agent support**: Query Assistant, Login Issuer, Analyser, Decision
- **Session management** with automatic session ID generation
- **Live message streaming** with visual feedback

### 🔧 **API Testing Panel**
- **Chat Session Management**: Create and retrieve chat sessions
- **MCP Tools Testing**: Test all available MCP methods
- **Gmail Integration**: Authenticate and test Gmail functionality
- **Server-Sent Events (SSE)**: Real-time event streaming

### 📊 **Monitoring & Logging**
- **Backend status monitoring** with real-time updates
- **Comprehensive response logging** with timestamps
- **Error handling and display**
- **Request/response inspection**

## Prerequisites

- Node.js (v14 or higher)
- Your MCP Vertx backend server running on `http://localhost:8080`

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend-test-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage Guide

### 1. **Backend Status**
- The application automatically checks backend connectivity
- Status indicator shows "Online" (green) or "Offline" (red)
- Periodic checks every 30 seconds

### 2. **Chat Interface**

#### **Agent Types:**
- **Query Assistant**: For expense-related queries
- **Login Issuer**: For login-related issues
- **Analyser**: Analyzes queries for submodule classification
- **Decision**: Decides whether to delegate or respond directly

#### **Using Chat:**
1. Select the desired agent type from the dropdown
2. Type your message in the chat input
3. Press Enter or click Send
4. Watch the real-time streaming response
5. Messages are automatically saved to the current session

### 3. **API Testing**

#### **Chat Session Management:**
- **Create New Session**: Generate a new chat session with custom parameters
- **Get All Sessions**: Retrieve existing sessions with optional filtering

#### **MCP Tools:**
- **get_tools**: List all available tools
- **get_resolution**: Get resolution for queries
- **get_answer_from_KnowledgeBase**: Query the knowledge base
- **get_files**: Get file listings
- **get_team_approvals**: Get team approval data
- **get_todays_emails**: Fetch today's emails (requires Gmail auth)
- **feed_query**: Feed queries to the system

#### **Gmail Integration:**
- Click "Authenticate Gmail" to start OAuth flow
- Follow browser prompts to authorize
- Test email functionality after authentication

#### **Server-Sent Events:**
- Connect to SSE endpoint for real-time events
- Monitor connection status
- View incoming event messages

### 4. **Response Log**
- All API calls and responses are logged with timestamps
- Use "Clear Log" to reset the log
- Log entries show request details and response data

## API Endpoints Tested

### **Chat Endpoints:**
- `POST /stream/chat` - Query assistant agent
- `POST /stream/login` - Login issuer agent
- `POST /stream/analyser` - Analyser agent
- `POST /stream/decision` - Decision agent

### **Session Management:**
- `POST /create/newChat` - Create new chat session
- `GET /allChats` - Get all chat sessions

### **MCP Endpoints:**
- `POST /mcp/message` - Send JSON-RPC messages
- `POST /mcp/gmail/auth` - Gmail authentication
- `GET /mcp/sse` - Server-Sent Events

## Configuration

### **Backend URL:**
The application is configured to connect to `http://localhost:8080`. To change this:

1. Edit `public/app.js`
2. Update the `BACKEND_URL` constant:
   ```javascript
   const BACKEND_URL = 'http://your-backend-url:port';
   ```

### **Port Configuration:**
To change the frontend port, edit `server.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

## Troubleshooting

### **Backend Connection Issues:**
1. Ensure your backend server is running on port 8080
2. Check CORS configuration in your backend
3. Verify network connectivity

### **Chat Streaming Issues:**
1. Check browser console for errors
2. Verify backend streaming endpoints are working
3. Ensure proper JSON response format

### **Gmail Authentication Issues:**
1. Verify Gmail API credentials are configured
2. Check browser popup blockers
3. Ensure OAuth redirect URI is correct

### **SSE Connection Issues:**
1. Check backend SSE endpoint is accessible
2. Verify CORS allows EventSource connections
3. Check browser console for connection errors

## Development

### **Running in Development Mode:**
```bash
npm run dev
```
This uses nodemon for automatic server restart on file changes.

### **File Structure:**
```
frontend-test-app/
├── package.json          # Dependencies and scripts
├── server.js             # Express server
├── README.md             # This file
└── public/
    ├── index.html        # Main HTML file
    ├── styles.css        # CSS styles
    └── app.js           # JavaScript functionality
```

### **Adding New Features:**
1. Update HTML structure in `index.html`
2. Add styles in `styles.css`
3. Implement functionality in `app.js`
4. Update this README with new features

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Notes

- This is a testing application - do not use in production
- Backend credentials and API keys should be properly secured
- CORS is configured for development use only

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the response log for API call details
3. Verify backend server is running and accessible
4. Check network connectivity and CORS configuration

---

**Happy Testing! 🚀** 