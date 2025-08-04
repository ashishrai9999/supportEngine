const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Frontend server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
    console.log(`Backend server should be running at http://localhost:8080`);
    console.log(`Open http://localhost:${PORT} in your browser to test the application`);
}); 