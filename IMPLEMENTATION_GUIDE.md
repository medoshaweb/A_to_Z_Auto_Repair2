# 🛠️ Quick Implementation Guide

## Step 1: Add Toast Notifications (15 minutes)

### Install
```bash
cd frontend
npm install react-hot-toast
```

### Setup
Add to `frontend/src/App.jsx`:
```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      {/* ... rest of your app */}
    </Router>
  );
}
```

### Usage Example
```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Order created successfully!');

// Error
toast.error('Failed to create order');

// Loading
const toastId = toast.loading('Creating order...');
// Later: toast.success('Order created!', { id: toastId });
```

---

## Step 2: AI Chatbot Setup (1-2 hours)

### Install OpenAI SDK
```bash
cd backend
npm install openai
```

### Create Chatbot Controller
Create `backend/controllers/chatbotController.js`:
```javascript
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant for A to Z Auto Repair. 
        You help customers with:
        - Service inquiries
        - Appointment scheduling
        - Pricing questions
        - Service hours: Monday-Saturday 7:00AM-6:00PM
        - Phone: 1800 456 7890
        
        Be friendly, professional, and concise.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
    });

    res.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Chatbot service unavailable' });
  }
};

module.exports = { chatWithBot };
```

### Add Route
In `backend/routes/chatbot.js`:
```javascript
const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatbotController');

router.post('/chat', chatWithBot);

module.exports = router;
```

### Add to server.js
```javascript
const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);
```

### Frontend Component
Create `frontend/src/components/AIChatbot.jsx`:
```jsx
import React, { useState } from 'react';
import { api } from '../api';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/chat', {
        message: input,
        conversationHistory: messages,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 Chat
      </button>
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="message assistant">Thinking...</div>}
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
```

### Add to App.jsx
```jsx
import AIChatbot from './components/AIChatbot';

// Inside your main App component
<AIChatbot />
```

---

## Step 3: Environment Variables

Add to `backend/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Get API key from: https://platform.openai.com/api-keys

---

## Step 4: Service Recommendations (2-3 hours)

### Create Recommendation Service
`backend/controllers/recommendationsController.js`:
```javascript
const pool = require('../config/database');

const getServiceRecommendations = async (req, res) => {
  try {
    const { vehicle_id, customer_id } = req.params;

    // Get vehicle info
    const [vehicles] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const vehicle = vehicles[0];
    const mileage = vehicle.mileage || 0;
    const year = vehicle.year || new Date().getFullYear();
    const age = new Date().getFullYear() - year;

    // Get service history
    const [orders] = await pool.execute(
      `SELECT o.*, os.service_id 
       FROM orders o
       JOIN order_services os ON o.id = os.order_id
       WHERE o.vehicle_id = ? AND o.status = 'Completed'
       ORDER BY o.created_at DESC`,
      [vehicle_id]
    );

    const recommendations = [];

    // Mileage-based recommendations
    if (mileage > 0) {
      if (mileage % 5000 < 500) {
        recommendations.push({
          service: 'Oil Change',
          reason: 'Due every 5,000 miles',
          priority: 'high'
        });
      }
      if (mileage % 15000 < 500) {
        recommendations.push({
          service: 'Tire Rotation',
          reason: 'Due every 15,000 miles',
          priority: 'medium'
        });
      }
      if (mileage >= 30000 && mileage < 35000) {
        recommendations.push({
          service: 'Major Service',
          reason: '30,000-mile service interval',
          priority: 'high'
        });
      }
    }

    // Age-based recommendations
    if (age >= 5) {
      recommendations.push({
        service: 'Battery Check',
        reason: 'Batteries typically last 3-5 years',
        priority: 'medium'
      });
    }

    // Check last service dates
    const lastServiceDate = orders[0]?.created_at;
    if (lastServiceDate) {
      const daysSince = Math.floor(
        (new Date() - new Date(lastServiceDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 180) {
        recommendations.push({
          service: 'General Inspection',
          reason: 'No service in over 6 months',
          priority: 'medium'
        });
      }
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getServiceRecommendations };
```

---

## Step 5: Real-Time Updates (Socket.io)

### Backend Setup
```bash
cd backend
npm install socket.io
```

### server.js
```javascript
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('order:update', (orderId) => {
    // Emit order updates to all clients
    io.emit('order:updated', { orderId });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Frontend
```bash
cd frontend
npm install socket.io-client
```

```jsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

useEffect(() => {
  socket.on('order:updated', (data) => {
    // Update order status in UI
    toast.success('Order status updated!');
  });

  return () => socket.disconnect();
}, []);
```

---

## Next Steps

1. **Start with toast notifications** - Quick win, immediate improvement
2. **Add AI chatbot** - High impact, modern feature
3. **Implement service recommendations** - Business value
4. **Add real-time updates** - Better UX

Each feature can be implemented independently, so you can prioritize based on your needs!

