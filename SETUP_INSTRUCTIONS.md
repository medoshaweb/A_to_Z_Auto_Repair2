# 🚀 Setup Instructions for New Features

## Installation Steps

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

This will install:
- `react-hot-toast` - Toast notifications
- `socket.io-client` - Real-time WebSocket client

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

This will install:
- `socket.io` - Real-time WebSocket server
- `openai` - AI chatbot (optional - works without API key)

### 3. Environment Variables

#### Backend (.env)
Add to `backend/.env`:
```env
# Existing variables...
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=A_to_Z_Auto_Repair
JWT_SECRET=your_jwt_secret_key_here

# New variables
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here  # Optional - chatbot works without it
```

**Note**: The AI chatbot will work without an OpenAI API key using fallback responses. To enable full AI capabilities:
1. Sign up at https://platform.openai.com
2. Get your API key
3. Add it to `.env`

### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
# or for development
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## ✅ Features Implemented

### 1. Toast Notifications ✅
- **Location**: Global in `App.jsx`
- **Usage**: Import `toast` from `react-hot-toast`
- **Examples**:
  ```jsx
  import toast from 'react-hot-toast';
  
  toast.success('Success message');
  toast.error('Error message');
  toast.loading('Loading...');
  ```

### 2. AI Chatbot ✅
- **Location**: Floating button on all pages
- **Features**:
  - Works with or without OpenAI API key
  - Fallback responses if OpenAI not configured
  - Real-time chat interface
  - Conversation history
- **API Endpoint**: `POST /api/chatbot/chat`

### 3. Service Recommendations ✅
- **Location**: Customer Dashboard
- **Features**:
  - Mileage-based recommendations
  - Age-based recommendations
  - Service history analysis
  - Priority levels (High/Medium)
  - Cost estimates
- **API Endpoint**: `GET /api/recommendations/vehicle/:vehicle_id`

### 4. Real-Time Order Tracking ✅
- **Technology**: Socket.io
- **Features**:
  - Live order status updates
  - Toast notifications for status changes
  - Automatic room joining for customer orders
- **Events**:
  - `order:status` - Status change notifications
  - `order:updated` - General order updates

## 🎯 Usage Examples

### Using Toast Notifications
```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Order created successfully!');

// Error
toast.error('Failed to create order');

// Loading (with promise)
const promise = createOrder(data);
toast.promise(promise, {
  loading: 'Creating order...',
  success: 'Order created!',
  error: 'Failed to create order',
});
```

### Using Socket.io for Real-Time Updates
```jsx
import { useSocket } from '../contexts/SocketContext';

const { joinOrderRoom, isConnected } = useSocket();

// Join order room for updates
useEffect(() => {
  if (orderId) {
    joinOrderRoom(orderId);
  }
}, [orderId]);
```

### Using Service Recommendations API
```jsx
import { recommendationsAPI } from '../api';

const fetchRecommendations = async (vehicleId) => {
  try {
    const data = await recommendationsAPI.getByVehicle(vehicleId);
    console.log(data.recommendations);
  } catch (error) {
    console.error(error);
  }
};
```

## 🔧 Troubleshooting

### Chatbot not responding
- Check if OpenAI API key is set (optional)
- Check browser console for errors
- Verify backend is running

### Real-time updates not working
- Ensure Socket.io is installed on both frontend and backend
- Check that `FRONTEND_URL` is set correctly in backend `.env`
- Verify WebSocket connection in browser DevTools → Network

### Recommendations not showing
- Ensure vehicle has mileage data
- Check that vehicle exists in database
- Verify API endpoint is accessible

## 📝 Next Steps

1. **Test all features** in development
2. **Add OpenAI API key** for full chatbot capabilities (optional)
3. **Customize chatbot responses** in `backend/controllers/chatbotController.js`
4. **Add more recommendation rules** in `backend/controllers/recommendationsController.js`
5. **Update more components** to use toast notifications

## 🎨 Customization

### Chatbot System Prompt
Edit `backend/controllers/chatbotController.js` to customize the AI assistant's behavior.

### Recommendation Rules
Edit `backend/controllers/recommendationsController.js` to add custom recommendation logic.

### Toast Styling
Toast styles are configured in `App.jsx` and use CSS variables for theme support.

## 📚 Documentation

- **Toast Notifications**: https://react-hot-toast.com
- **Socket.io**: https://socket.io/docs/v4
- **OpenAI API**: https://platform.openai.com/docs

