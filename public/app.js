// Global variables
let currentSessionId = null;
let eventSource = null;
let isStreaming = false;

// Backend API configuration
const BACKEND_URL = 'https://idfc-mmt-stage.dice.tech/support';

// DOM elements
const elements = {
    backendStatus: document.getElementById('backend-status'),
    sessionId: document.getElementById('session-id'),
    newSessionBtn: document.getElementById('new-session-btn'),
    agentType: document.getElementById('agent-type'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    chatMessages: document.getElementById('chat-messages'),
    responseLog: document.getElementById('response-log'),
    clearLogBtn: document.getElementById('clear-log-btn'),
    
    // API Testing elements
    createSessionBtn: document.getElementById('create-session-btn'),
    getSessionsBtn: document.getElementById('get-sessions-btn'),
    clientId: document.getElementById('client-id'),
    employeeId: document.getElementById('employee-id'),
    moduleSelect: document.getElementById('module-select'),
    filterClientId: document.getElementById('filter-client-id'),
    filterEmployeeId: document.getElementById('filter-employee-id'),
    sessionsResult: document.getElementById('sessions-result'),
    
    // MCP elements
    sendMcpBtn: document.getElementById('send-mcp-btn'),
    mcpMethod: document.getElementById('mcp-method'),
    mcpQuery: document.getElementById('mcp-query'),
    mcpModule: document.getElementById('mcp-module'),
    mcpResult: document.getElementById('mcp-result'),
    
    // Gmail elements
    gmailAuthBtn: document.getElementById('gmail-auth-btn'),
    gmailAuthResult: document.getElementById('gmail-auth-result'),
    
    // SSE elements
    connectSseBtn: document.getElementById('connect-sse-btn'),
    disconnectSseBtn: document.getElementById('disconnect-sse-btn'),
    sseStatus: document.getElementById('sse-status'),
    sseMessages: document.getElementById('sse-messages'),
    
    // Tab elements
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkBackendStatus();
});

// Initialize the application
function initializeApp() {
    log('Frontend application initialized');
    generateNewSessionId();
}

// Setup all event listeners
function setupEventListeners() {
    // Chat functionality
    elements.sendBtn.addEventListener('click', sendChatMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    // Session management
    elements.newSessionBtn.addEventListener('click', generateNewSessionId);
    elements.createSessionBtn.addEventListener('click', createChatSession);
    elements.getSessionsBtn.addEventListener('click', getAllChatSessions);
    
    // MCP functionality
    elements.sendMcpBtn.addEventListener('click', sendMcpMessage);
    
    // Gmail functionality
    elements.gmailAuthBtn.addEventListener('click', authenticateGmail);
    
    // SSE functionality
    elements.connectSseBtn.addEventListener('click', connectSSE);
    elements.disconnectSseBtn.addEventListener('click', disconnectSSE);
    
    // Utility
    elements.clearLogBtn.addEventListener('click', clearLog);
    
    // Tab functionality
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Method change handler for MCP
    elements.mcpMethod.addEventListener('change', updateMcpForm);
}

// Backend status checking
async function checkBackendStatus() {
    try {
        const response = await fetch("https://idfc-mmt-stage.dice.tech/health", { 
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            updateBackendStatus(true);
        } else {
            updateBackendStatus(false);
        }
    } catch (error) {
        updateBackendStatus(false);
        log(`Backend status check failed: ${error.message}`);
    }
}

function updateBackendStatus(isOnline) {
    const statusElement = elements.backendStatus;
    if (isOnline) {
        statusElement.textContent = 'Online';
        statusElement.className = 'status-indicator online';
    } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'status-indicator offline';
    }
}

// Session management
function generateNewSessionId() {
    currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    elements.sessionId.textContent = currentSessionId;
    log(`Generated new session ID: ${currentSessionId}`);
}

// Chat functionality
async function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message || isStreaming) return;
    
    const agentType = elements.agentType.value;
    
    // Add user message to chat
    addMessageToChat('user', message);
    elements.chatInput.value = '';
    
    // Determine endpoint based on agent type
    let endpoint;
    switch (agentType) {
        case 'query_assistant':
            endpoint = '/stream/chat';
            break;
        case 'login_issuer':
            endpoint = '/stream/chat';
            break;
        case 'analyser':
            endpoint = '/stream/analyser';
            break;
        case 'decision':
            endpoint = '/stream/decision';
            break;
        default:
            endpoint = '/stream/chat';
    }
    
    // Prepare request payload
    const payload = {
        params: {
            query: message,
            module: elements.moduleSelect.value,
            sessionId: currentSessionId,
            clientId: elements.clientId.value,
            employeeId: elements.employeeId.value
        }
    };
    
    log(`Sending chat message to ${endpoint}: ${JSON.stringify(payload, null, 2)}`);
    
    try {
        isStreaming = true;
        elements.sendBtn.disabled = true;
        
        // Show thinking indicator
        addThinkingIndicator();
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        // Remove thinking indicator and create streaming message element
        removeThinkingIndicator();
        const streamingMessage = addMessageToChat('assistant', '', true);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.token) {
                            assistantResponse += data.token;
                            streamingMessage.textContent = assistantResponse;
                            streamingMessage.scrollIntoView({ behavior: 'smooth' });
                        }
                    } catch (e) {
                        // Ignore parsing errors for non-JSON data
                    }
                }
            }
        }
        
        // Remove streaming class and finalize message
        streamingMessage.classList.remove('streaming');
        log(`Chat response received: ${assistantResponse.substring(0, 100)}...`);
        
    } catch (error) {
        // Remove thinking indicator in case of error
        removeThinkingIndicator();
        log(`Chat error: ${error.message}`);
        addMessageToChat('assistant', `Error: ${error.message}`);
    } finally {
        isStreaming = false;
        elements.sendBtn.disabled = false;
    }
}

function addMessageToChat(role, content, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    if (isStreaming) {
        messageDiv.classList.add('streaming');
    }
    messageDiv.textContent = content;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    return messageDiv;
}

function addThinkingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'Thinking';
    messageDiv.id = 'thinking-indicator';
    
    const thinkingContent = document.createElement('div');
    thinkingContent.style.display = 'flex';
    thinkingContent.style.alignItems = 'center';
    thinkingContent.style.gap = '10px';
    
    const thinkingText = document.createElement('span');
    thinkingText.textContent = 'Thinking';
    
    const thinkingDots = document.createElement('div');
    thinkingDots.className = 'thinking-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'thinking-dot';
        thinkingDots.appendChild(dot);
    }
    
    thinkingContent.appendChild(thinkingText);
    thinkingContent.appendChild(thinkingDots);
    messageDiv.appendChild(thinkingContent);
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    return messageDiv;
}

function removeThinkingIndicator() {
    const thinkingIndicator = document.getElementById('thinking-indicator');
    if (thinkingIndicator) {
        thinkingIndicator.remove();
    }
}

// API Testing Functions
async function createChatSession() {
    const payload = {
        params: {
            clientId: elements.clientId.value,
            employeeId: elements.employeeId.value,
            module: elements.moduleSelect.value
        }
    };
    
    log(`Creating chat session: ${JSON.stringify(payload, null, 2)}`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/create/newChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        log(`Create session response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.success) {
            currentSessionId = result.data.sessionId;
            elements.sessionId.textContent = currentSessionId;
            elements.sessionsResult.textContent = 'Session created successfully!';
        } else {
            elements.sessionsResult.textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        log(`Create session error: ${error.message}`);
        elements.sessionsResult.textContent = `Error: ${error.message}`;
    }
}

async function getAllChatSessions() {
    const clientId = elements.filterClientId.value;
    const employeeId = elements.filterEmployeeId.value;
    
    let url = `${BACKEND_URL}/allChats`;
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (employeeId) params.append('employeeId', employeeId);
    if (params.toString()) url += '?' + params.toString();
    
    log(`Getting chat sessions: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        log(`Get sessions response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.success) {
            elements.sessionsResult.textContent = JSON.stringify(result.data, null, 2);
        } else {
            elements.sessionsResult.textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        log(`Get sessions error: ${error.message}`);
        elements.sessionsResult.textContent = `Error: ${error.message}`;
    }
}

async function sendMcpMessage() {
    const method = elements.mcpMethod.value;
    const query = elements.mcpQuery.value;
    const module = elements.mcpModule.value;
    
    const payload = {
        method: method,
        params: {}
    };
    
    // Add parameters based on method
    if (query && ['get_resolution', 'get_answer_from_KnowledgeBase'].includes(method)) {
        payload.params.query = query;
    }
    if (module && method === 'get_resolution') {
        payload.params.module = module;
    }
    if (method === 'get_todays_emails') {
        payload.params.date = new Date().toISOString().split('T')[0];
    }
    
    log(`Sending MCP message: ${JSON.stringify(payload, null, 2)}`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/mcp/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        log(`MCP response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.success) {
            elements.mcpResult.textContent = JSON.stringify(result.data, null, 2);
        } else {
            elements.mcpResult.textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        log(`MCP error: ${error.message}`);
        elements.mcpResult.textContent = `Error: ${error.message}`;
    }
}

async function authenticateGmail() {
    log('Authenticating Gmail...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/mcp/gmail/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        log(`Gmail auth response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.success) {
            elements.gmailAuthResult.textContent = 'Gmail authentication successful!';
        } else {
            elements.gmailAuthResult.textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        log(`Gmail auth error: ${error.message}`);
        elements.gmailAuthResult.textContent = `Error: ${error.message}`;
    }
}

// SSE functionality
function connectSSE() {
    if (eventSource) {
        eventSource.close();
    }
    
    log('Connecting to SSE...');
    
    eventSource = new EventSource(`${BACKEND_URL}/mcp/sse`);
    
    eventSource.onopen = function() {
        elements.sseStatus.textContent = 'Connected';
        elements.sseStatus.className = 'status-indicator online';
        elements.connectSseBtn.disabled = true;
        elements.disconnectSseBtn.disabled = false;
        log('SSE connection opened');
    };
    
    eventSource.onmessage = function(event) {
        log(`SSE message: ${event.data}`);
        elements.sseMessages.textContent += `${new Date().toLocaleTimeString()}: ${event.data}\n`;
    };
    
    eventSource.addEventListener('connected', function(event) {
        log(`SSE connected event: ${event.data}`);
        elements.sseMessages.textContent += `${new Date().toLocaleTimeString()}: Connected - ${event.data}\n`;
    });
    
    eventSource.addEventListener('result', function(event) {
        log(`SSE result event: ${event.data}`);
        elements.sseMessages.textContent += `${new Date().toLocaleTimeString()}: Result - ${event.data}\n`;
    });
    
    eventSource.addEventListener('cancel', function(event) {
        log(`SSE cancel event: ${event.data}`);
        elements.sseMessages.textContent += `${new Date().toLocaleTimeString()}: Cancel - ${event.data}\n`;
    });
    
    eventSource.onerror = function(error) {
        log(`SSE error: ${error}`);
        elements.sseStatus.textContent = 'Error';
        elements.sseStatus.className = 'status-indicator offline';
        elements.connectSseBtn.disabled = false;
        elements.disconnectSseBtn.disabled = true;
    };
}

function disconnectSSE() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    
    elements.sseStatus.textContent = 'Disconnected';
    elements.sseStatus.className = 'status-indicator offline';
    elements.connectSseBtn.disabled = false;
    elements.disconnectSseBtn.disabled = true;
    log('SSE disconnected');
}

// Tab functionality
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    elements.tabBtns.forEach(btn => btn.classList.remove('active'));
    elements.tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Form updates based on MCP method
function updateMcpForm() {
    const method = elements.mcpMethod.value;
    const queryField = elements.mcpQuery.parentElement;
    const moduleField = elements.mcpModule.parentElement;
    
    // Show/hide fields based on method
    if (['get_resolution', 'get_answer_from_KnowledgeBase'].includes(method)) {
        queryField.style.display = 'block';
    } else {
        queryField.style.display = 'none';
    }
    
    if (method === 'get_resolution') {
        moduleField.style.display = 'block';
    } else {
        moduleField.style.display = 'none';
    }
}

// Utility functions
function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}\n`;
    elements.responseLog.textContent += logEntry;
    elements.responseLog.scrollTop = elements.responseLog.scrollHeight;
    console.log(message);
}

function clearLog() {
    elements.responseLog.textContent = '';
}

// Periodic backend status check
setInterval(checkBackendStatus, 30000); // Check every 30 seconds 