# A to Z Auto Repair Management System

A comprehensive full-stack web application for managing auto repair shop operations, including customer management, service orders, employee management, and payment processing.

## 🚀 Features

### Admin/Staff Features
- **Dashboard**: Overview of all operations and quick access to key functions
- **Order Management**: Create, view, update, and track service orders
- **Customer Management**: Add, edit, and manage customer information
- **Employee Management**: Add, edit, and manage staff members with role-based access
- **Service Management**: Manage available services and repairs
- **Real-time Updates**: Socket.io integration for live order status updates
- **Role-Based Access Control**: Admin, Manager, and Employee roles with different permissions

### Customer Features (Extranet)
- **Customer Dashboard**: View personal account information
- **Vehicle Management**: Add and manage vehicles
- **Order Creation**: Create new service orders
- **Order Tracking**: View order status and history

### Additional Features
- **AI Chatbot**: Interactive customer support chatbot
- **Payment Processing**: Stripe integration for secure payments
- **Theme Toggle**: Dark/Light mode support
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Toast notifications
- **Stripe.js** - Payment processing
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Stripe** - Payment processing
- **OpenAI API** - AI chatbot integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd A_to_Z_Auto_Repair
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=A_to_Z_Auto_Repair

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI Configuration (Optional - for chatbot)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Database Setup

The database will be automatically initialized when you start the backend server. Alternatively, you can manually run the schema:

```bash
mysql -u root -p < backend/schema.sql
```

Or use the initialization script:

```bash
cd backend
node config/initDatabase.js
```

## 🚀 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` (or the next available port)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
A_to_Z_Auto_Repair/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth and authorization middleware
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── server.js         # Entry point
│   └── schema.sql        # Database schema
│
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── api/          # API client functions
│       ├── components/   # React components
│       ├── contexts/     # React contexts
│       ├── pages/        # Page components
│       └── App.jsx       # Main app component
│
└── README.md
```

## 🔐 User Roles and Permissions

### Admin
- Full access to all features
- Can manage employees (add, edit, delete)
- Can manage customers
- Can manage orders
- Can manage services

### Manager
- Can manage customers
- Can manage orders
- Can manage services
- Cannot manage employees

### Employee
- Can view orders
- Can update order status (with limitations)
- Cannot create new orders
- Cannot manage customers or employees

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin/Staff login
- `POST /api/auth/register` - Admin/Staff registration
- `POST /api/customer-auth/login` - Customer login
- `POST /api/customer-auth/register` - Customer registration

### Employees (Admin only)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

## 🔧 Utility Scripts

### Update User Role
To update a user's role in the database:

```bash
cd backend
node scripts/updateUserRole.js
```

Edit the script to change the email and role as needed.

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 is already in use:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill //F //PID <PID_NUMBER>
```

**Linux/Mac:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

1. Ensure MySQL is running
2. Check database credentials in `.env`
3. Verify database exists: `A_to_Z_Auto_Repair`
4. Check MySQL user permissions

### Authentication Issues

If you're getting 403 Forbidden errors:

1. **Log out and log back in** - This refreshes your JWT token with the correct role
2. Check your role in the database - Ensure it's set to "Admin" (case-sensitive after normalization)
3. Verify the token includes the role in the JWT payload

### Employee List Not Showing

1. Check browser console for errors
2. Verify you're logged in as Admin
3. Check backend logs for authorization details
4. Ensure the API call includes the authentication token

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | MySQL host | Yes | `localhost` |
| `DB_PORT` | MySQL port | No | `3306` |
| `DB_USER` | MySQL username | Yes | `root` |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | Database name | No | `A_to_Z_Auto_Repair` |
| `JWT_SECRET` | Secret for JWT tokens | Yes | - |
| `PORT` | Server port | No | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe secret key | No | - |
| `OPENAI_API_KEY` | OpenAI API key for chatbot | No | - |

### Frontend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | `http://localhost:5000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- React community
- Express.js team
- MySQL team
- All open-source contributors

---

**Note**: Make sure to set up your environment variables before running the application. The database will be automatically initialized on first run if it doesn't exist.

