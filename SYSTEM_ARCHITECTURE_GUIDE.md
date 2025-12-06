# 🎓 A to Z Auto Repair - Complete System Architecture Guide

## 📚 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Data Flow](#data-flow)
6. [Key Concepts](#key-concepts)

---

## 🏗️ System Overview

### What is This Application?
A **Full-Stack Web Application** for managing an auto repair shop with:
- **Frontend**: React.js (User Interface)
- **Backend**: Node.js + Express.js (Server/API)
- **Database**: MySQL (Data Storage)

### How They Work Together
```
User Browser (React Frontend)
    ↓ HTTP Requests
Express.js Backend (API Server)
    ↓ SQL Queries
MySQL Database (Data Storage)
    ↓ Response
Backend processes data
    ↓ JSON Response
Frontend displays to user
```

---

## 📁 Backend Structure

### Root Files

#### `server.js` - **The Main Entry Point**
**Purpose**: Starts the web server and sets up all routes

**What it does**:
1. Creates Express app
2. Sets up middleware (CORS, JSON parsing)
3. Initializes database connection
4. Sets up Socket.io for real-time updates
5. Registers all API routes
6. Starts listening on port 5000

**Key Code**:
```javascript
const app = express();  // Create Express application
app.use(cors());        // Allow frontend to connect
app.use(express.json()); // Parse JSON requests
app.use("/api/orders", orderRoutes); // Register routes
server.listen(PORT);    // Start server
```

---

### 📂 `config/` Directory

#### `database.js` - **Database Connection Pool**
**Purpose**: Creates a reusable connection pool to MySQL database

**What it does**:
- Creates a pool of database connections (max 10)
- Allows multiple queries without creating new connections each time
- Exports the pool so other files can use it

**Key Concept**: Connection pooling = efficiency (reuse connections)

```javascript
const pool = mysql.createPool({
  host: "localhost",
  database: "A_to_Z_Auto_Repair",
  connectionLimit: 10  // Max 10 simultaneous connections
});
```

#### `initDatabase.js` - **Database Setup Script**
**Purpose**: Automatically creates database and tables when server starts

**What it does**:
1. Connects to MySQL
2. Creates database if it doesn't exist
3. Creates all tables (users, customers, vehicles, orders, etc.)
4. Adds default services
5. Handles migrations (adds new columns to existing tables)

**Key Tables Created**:
- `users` - Admin accounts
- `customers` - Customer accounts
- `vehicles` - Customer vehicles
- `orders` - Service orders
- `services` - Available services
- `order_services` - Links orders to services (many-to-many)
- `employees` - Staff members

---

### 📂 `controllers/` Directory

**Purpose**: Contains business logic (what happens when API is called)

#### `authController.js` - **Admin Authentication Logic**
**Functions**:
- `login()` - Validates admin credentials, returns JWT token
- `register()` - Creates new admin account
- `forgotPassword()` - Generates password reset token
- `resetPassword()` - Resets password using token
- `forgotUsername()` - Retrieves username by email

**Key Process**:
```
User sends email/password
  → Controller checks database
  → Validates password (bcrypt)
  → Creates JWT token
  → Returns token to frontend
```

#### `customerAuthController.js` - **Customer Authentication Logic**
**Same as authController but for customers**
- Separate authentication system for customers
- Different table (customers vs users)

#### `customersController.js` - **Customer Management**
**Functions**:
- `getAllCustomers()` - Get all customers with search/pagination
- `getCustomerById()` - Get single customer details
- `createCustomer()` - Add new customer
- `updateCustomer()` - Update customer info
- `getCustomerVehicles()` - Get customer's vehicles
- `createCustomerVehicle()` - Add vehicle to customer
- `getCustomerOrders()` - Get customer's order history

**Key Concept**: CRUD operations (Create, Read, Update, Delete)

#### `ordersController.js` - **Order Management**
**Functions**:
- `getAllOrders()` - Get all orders with customer/vehicle info
- `getOrderById()` - Get single order details
- `createOrder()` - Create new service order
- `updateOrder()` - Update order status/info
- `addServiceToOrder()` - Link service to order

**Special Feature**: Emits Socket.io events for real-time updates

#### `employeesController.js` - **Employee Management**
**Functions**:
- `getAllEmployees()` - List all employees
- `getEmployeeById()` - Get employee details
- `createEmployee()` - Add new employee
- `updateEmployee()` - Update employee info
- `deleteEmployee()` - Remove employee

#### `servicesController.js` - **Service Management**
**Functions**:
- `getAllServices()` - List all available services
- `getServiceById()` - Get service details
- `createService()` - Add new service
- `updateService()` - Update service info
- `deleteService()` - Remove service

#### `chatbotController.js` - **AI Chatbot Logic**
**Functions**:
- `chatWithBot()` - Processes user messages

**How it works**:
1. Receives user message
2. If OpenAI API key exists → Uses AI
3. If not → Uses intelligent fallback responses
4. Returns response to frontend

#### `recommendationsController.js` - **Service Recommendations**
**Functions**:
- `getServiceRecommendations()` - Analyzes vehicle and suggests services

**Logic**:
- Checks vehicle mileage → Suggests oil change every 5K miles
- Checks vehicle age → Suggests battery check after 5 years
- Checks service history → Suggests maintenance if overdue

---

### 📂 `routes/` Directory

**Purpose**: Defines API endpoints (URLs) and connects them to controllers

#### `auth.js` - **Admin Auth Routes**
```javascript
POST /api/auth/login        → authController.login
POST /api/auth/signup      → authController.register
POST /api/auth/forgot-password → authController.forgotPassword
```

#### `customerAuth.js` - **Customer Auth Routes**
```javascript
POST /api/customer-auth/login → customerAuthController.login
POST /api/customer-auth/signup → customerAuthController.register
```

#### `customers.js` - **Customer Routes**
```javascript
GET    /api/customers              → getAllCustomers
GET    /api/customers/:id          → getCustomerById
POST   /api/customers              → createCustomer
PUT    /api/customers/:id          → updateCustomer
GET    /api/customers/:id/vehicles → getCustomerVehicles
POST   /api/customers/:id/vehicles → createCustomerVehicle
GET    /api/customers/:id/orders   → getCustomerOrders
```

#### `orders.js` - **Order Routes**
```javascript
GET  /api/orders           → getAllOrders
GET  /api/orders/:id       → getOrderById
POST /api/orders           → createOrder (protected)
PUT  /api/orders/:id       → updateOrder
POST /api/orders/:id/services → addServiceToOrder
```

#### `employees.js` - **Employee Routes**
```javascript
GET    /api/employees      → getAllEmployees
GET    /api/employees/:id   → getEmployeeById
POST   /api/employees       → createEmployee
PUT    /api/employees/:id   → updateEmployee
DELETE /api/employees/:id   → deleteEmployee
```

#### `services.js` - **Service Routes**
```javascript
GET    /api/services       → getAllServices
GET    /api/services/:id   → getServiceById
POST   /api/services       → createService
PUT    /api/services/:id   → updateService
DELETE /api/services/:id   → deleteService
```

#### `chatbot.js` - **Chatbot Routes**
```javascript
POST /api/chatbot/chat → chatWithBot
```

#### `recommendations.js` - **Recommendations Routes**
```javascript
GET /api/recommendations/vehicle/:vehicle_id → getServiceRecommendations
```

---

### 📂 `middleware/` Directory

**Purpose**: Functions that run before controllers (authentication, validation)

#### `auth.js` - **Admin Authentication Middleware**
**Purpose**: Protects admin routes - checks if user is logged in

**How it works**:
```javascript
1. Extract token from request header
2. Verify token using JWT
3. If valid → Continue to controller
4. If invalid → Return 401 Unauthorized
```

#### `customerAuth.js` - **Customer Authentication Middleware**
**Same as auth.js but for customer tokens**

---

## 🎨 Frontend Structure

### Root Files

#### `index.jsx` - **Application Entry Point**
**Purpose**: Renders the React app to the DOM

**What it does**:
1. Imports React and ReactDOM
2. Wraps app in providers (ThemeProvider, SocketProvider)
3. Renders App component to `#root` div in HTML

**Key Concept**: Providers give all components access to context (theme, socket)

#### `index.css` - **Global Styles**
**Purpose**: Defines CSS variables for theming (light/dark mode)

**Key Variables**:
```css
--bg-primary: #ffffff (light) / #1a1a1a (dark)
--text-primary: #333333 (light) / #e0e0e0 (dark)
--accent-color: #1E3A8A
```

---

### 📂 `contexts/` Directory

**Purpose**: Global state management (shared data across components)

#### `ThemeContext.jsx` - **Theme Management**
**Purpose**: Manages dark/light mode theme

**What it does**:
- Stores current theme in state
- Saves to localStorage
- Sets `data-theme` attribute on HTML element
- Provides `toggleTheme()` function

**Usage**:
```jsx
const { theme, toggleTheme } = useTheme();
// theme = 'light' or 'dark'
```

#### `SocketContext.jsx` - **Real-Time Connection**
**Purpose**: Manages WebSocket connection for real-time updates

**What it does**:
- Connects to Socket.io server
- Listens for order updates
- Shows toast notifications when orders change
- Provides `joinOrderRoom()` to subscribe to specific orders

---

### 📂 `api/` Directory

**Purpose**: Centralized API calls (reusable functions)

#### `config.js` - **Axios Configuration**
**Purpose**: Creates configured axios instance

**Features**:
- Base URL setup
- Automatic token injection (adds JWT to requests)
- Error handling (auto-redirect on 401)
- Request/response interceptors

**Key Concept**: Interceptors = code that runs before/after every request

#### `auth.js` - **Authentication API**
**Functions**:
- `adminAuthAPI.login()` - Admin login
- `adminAuthAPI.signup()` - Admin signup
- `customerAuthAPI.login()` - Customer login
- `customerAuthAPI.signup()` - Customer signup

#### `customers.js` - **Customer API**
**Functions**:
- `customersAPI.getAll()` - Get customers
- `customersAPI.getById()` - Get customer
- `customersAPI.create()` - Create customer
- `customersAPI.update()` - Update customer
- `customersAPI.getVehicles()` - Get vehicles
- `customersAPI.addVehicle()` - Add vehicle

#### `orders.js` - **Order API**
**Functions**:
- `ordersAPI.getAll()` - Get orders
- `ordersAPI.getById()` - Get order
- `ordersAPI.create()` - Create order
- `ordersAPI.update()` - Update order

#### `services.js` - **Service API**
**Functions**:
- `servicesAPI.getAll()` - Get services
- `servicesAPI.getById()` - Get service
- `servicesAPI.create()` - Create service

#### `employees.js` - **Employee API**
**Functions**:
- `employeesAPI.getAll()` - Get employees
- `employeesAPI.create()` - Create employee
- `employeesAPI.update()` - Update employee

#### `chatbot.js` - **Chatbot API**
**Functions**:
- `chatbotAPI.chat()` - Send message to AI

#### `recommendations.js` - **Recommendations API**
**Functions**:
- `recommendationsAPI.getByVehicle()` - Get recommendations

#### `index.js` - **Central Export**
**Purpose**: Exports all API functions from one place

---

### 📂 `components/` Directory

**Purpose**: Reusable UI components

#### `Header.jsx` - **Navigation Header**
**Purpose**: Top navigation bar on all pages

**Features**:
- Logo and navigation links
- Theme toggle button
- Login/logout buttons
- Responsive design

#### `Footer.jsx` - **Page Footer**
**Purpose**: Footer with contact info and links

#### `LoginForm.jsx` - **Admin Login Form**
**Purpose**: Form for admin login

**What it does**:
1. Collects email/password
2. Calls `adminAuthAPI.login()`
3. Stores token in localStorage
4. Redirects to dashboard
5. Shows toast notifications

#### `SignupForm.jsx` - **Admin Signup Form**
**Purpose**: Form for creating admin account

#### `CustomerLoginForm.jsx` - **Customer Login**
**Purpose**: Login form for customers

#### `CustomerSignupForm.jsx` - **Customer Signup**
**Purpose**: Signup form for customers

#### `AdminSidebar.jsx` - **Admin Navigation Sidebar**
**Purpose**: Left sidebar navigation for admin pages

**Links**:
- Dashboard
- Customers
- Orders
- Employees
- Services

#### `ThemeToggle.jsx` - **Theme Switch Button**
**Purpose**: Button to toggle dark/light mode

**How it works**:
- Uses `useTheme()` hook
- Calls `toggleTheme()` on click
- Updates icon (sun/moon)

#### `AIChatbot.jsx` - **AI Chatbot Component**
**Purpose**: Floating chatbot for customer support

**Features**:
- Floating button (bottom right)
- Chat interface
- Message history
- Typing indicators
- Calls `chatbotAPI.chat()`

#### `ForgotPassword.jsx` - **Password Recovery**
**Purpose**: Form to request password reset

#### `ForgotUsername.jsx` - **Username Recovery**
**Purpose**: Form to retrieve username

---

### 📂 `pages/` Directory

**Purpose**: Full page components (routes)

#### `HomePage.jsx` - **Landing Page**
**Purpose**: Public homepage

**Sections**:
- Hero section (welcome message)
- About Us
- Services grid
- Contact form

#### `Dashboard.jsx` - **Admin Dashboard**
**Purpose**: Main admin control panel

**Features**:
- Quick access cards
- Service overview
- Order management links
- Employee management

#### `LoginPage.jsx` - **Login Page Wrapper**
**Purpose**: Wraps login/signup forms with tabs

#### `CustomersList.jsx` - **Customer List Page**
**Purpose**: Displays all customers in a table

**Features**:
- Search functionality
- Pagination
- Links to customer details

#### `CustomerDetail.jsx` - **Customer Details Page**
**Purpose**: Shows single customer info

**Displays**:
- Customer information
- Vehicles list
- Order history

#### `AddCustomer.jsx` - **Add Customer Form**
**Purpose**: Form to create new customer

#### `EditCustomer.jsx` - **Edit Customer Form**
**Purpose**: Form to update customer info

#### `AddVehicle.jsx` - **Add Vehicle Form (Admin)**
**Purpose**: Admin form to add vehicle to customer

#### `OrdersList.jsx` - **Orders List Page**
**Purpose**: Displays all service orders

**Features**:
- Order status badges
- Customer/vehicle info
- Filter by status

#### `NewOrder.jsx` - **Create Order Page (Admin)**
**Purpose**: Admin form to create new order

**Process**:
1. Search for customer
2. Select customer
3. Select vehicle
4. Select services
5. Add description/price
6. Submit

#### `OrderDetail.jsx` - **Order Details Page**
**Purpose**: Shows single order details

**Displays**:
- Order information
- Customer details
- Vehicle details
- Services list
- Status updates

#### `EmployeesList.jsx` - **Employees List Page**
**Purpose**: Displays all employees

#### `AddEmployee.jsx` - **Add Employee Form**
**Purpose**: Form to create new employee

#### `EditEmployee.jsx` - **Edit Employee Form**
**Purpose**: Form to update employee

#### `ServicesList.jsx` - **Services List Page**
**Purpose**: Displays all available services

#### `CustomerDashboard.jsx` - **Customer Dashboard**
**Purpose**: Customer's personal dashboard

**Features**:
- Welcome message
- My Vehicles section
- Service Recommendations (AI-powered)
- My Orders section
- Real-time order updates

#### `CustomerAddVehicle.jsx` - **Add Vehicle (Customer)**
**Purpose**: Customer form to add their vehicle

#### `CustomerNewOrder.jsx` - **Request Service (Customer)**
**Purpose**: Customer form to request service

**Process**:
1. Select vehicle
2. Select services
3. Add description
4. Submit request

---

## 🔄 Data Flow Example

### Example: Customer Creates Order

```
1. Customer fills form (CustomerNewOrder.jsx)
   ↓
2. Form calls ordersAPI.create()
   ↓
3. API sends POST /api/orders to backend
   ↓
4. Route (orders.js) receives request
   ↓
5. Middleware (customerAuth.js) verifies token
   ↓
6. Controller (ordersController.js) processes:
   - Validates data
   - Inserts into orders table
   - Links services in order_services table
   - Emits Socket.io event
   ↓
7. Database stores order
   ↓
8. Controller returns JSON response
   ↓
9. Frontend receives response
   ↓
10. Toast notification shows success
   ↓
11. Socket.io broadcasts update to all clients
   ↓
12. CustomerDashboard receives update
   ↓
13. Order list refreshes automatically
```

---

## 🔑 Key Concepts Explained

### 1. **MVC Pattern (Model-View-Controller)**
- **Model**: Database (MySQL)
- **View**: React components (Frontend)
- **Controller**: Backend controllers (Business logic)

### 2. **RESTful API**
- **GET**: Retrieve data
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data

### 3. **JWT Authentication**
- Token-based authentication
- Token stored in localStorage
- Sent with every request
- Expires after 24 hours

### 4. **Socket.io (Real-Time)**
- WebSocket connection
- Server can push updates to clients
- No need to refresh page
- Used for order status updates

### 5. **Context API (React)**
- Global state management
- Theme context (dark/light mode)
- Socket context (real-time connection)
- Available to all components

### 6. **Axios Interceptors**
- Code that runs before/after requests
- Request interceptor: Adds token
- Response interceptor: Handles errors

### 7. **CSS Variables**
- Theme-aware styling
- Changes based on `data-theme` attribute
- One CSS file works for both themes

---

## 📊 Database Relationships

```
customers (1) ──→ (many) vehicles
customers (1) ──→ (many) orders
vehicles (1) ──→ (many) orders
orders (many) ──→ (many) services (via order_services)
```

**Key**: One customer can have many vehicles and many orders. One order can have many services.

---

## 🎯 How to Explain to Your Classmate

### Start with the Big Picture:
1. **Frontend** = What users see and interact with
2. **Backend** = Server that processes requests and talks to database
3. **Database** = Where all data is stored

### Then Explain the Flow:
1. User clicks button → Frontend sends request
2. Backend receives request → Processes it
3. Backend queries database → Gets/updates data
4. Backend sends response → Frontend updates UI

### Use Real Examples:
- "When you log in, the LoginForm sends your email/password to the backend, which checks the database, and if correct, gives you a token"
- "When you create an order, the form sends data to ordersController, which saves it to the database and notifies everyone via Socket.io"

---

## 🛠️ File Organization Principles

### Backend:
- **Routes** = Define URLs
- **Controllers** = Business logic
- **Middleware** = Authentication/validation
- **Config** = Setup files

### Frontend:
- **Pages** = Full screens (routes)
- **Components** = Reusable UI pieces
- **API** = Functions to call backend
- **Contexts** = Global state

---

This architecture follows **separation of concerns**: each file has one clear purpose, making the code maintainable and easy to understand!

