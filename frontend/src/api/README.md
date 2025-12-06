# API Configuration

This directory contains the centralized API configuration and service files for the A to Z Auto Repair application.

## Structure

- `config.js` - Axios instance with interceptors for authentication and error handling
- `auth.js` - Authentication API (admin and customer)
- `customers.js` - Customer management API
- `orders.js` - Order management API
- `services.js` - Service management API
- `employees.js` - Employee management API
- `vehicles.js` - Vehicle management API
- `index.js` - Central export file

## Configuration

The API base URL can be configured using environment variables. Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## Usage

### Import the API services

```javascript
import { customersAPI, ordersAPI, adminAuthAPI } from '../api';
```

### Example: Using the API

```javascript
// Login
const response = await adminAuthAPI.login(email, password);
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Get customers
const data = await customersAPI.getAll({ page: 1, limit: 10, search: 'John' });

// Create order
const order = await ordersAPI.create({
  customer_id: 1,
  vehicle_id: 1,
  description: 'Oil change',
  price: 50.00,
  service_ids: [1, 2]
});
```

## Features

- **Automatic Token Injection**: Tokens from localStorage are automatically added to request headers
- **Error Handling**: Global error handling with automatic redirect on 401 errors
- **Timeout**: 10-second timeout for all requests
- **Type Safety**: Consistent response structure

## Error Handling

The API automatically handles:
- 401 Unauthorized: Clears tokens and redirects to login
- Network errors: Returns user-friendly error messages
- Server errors: Returns error messages from the backend

