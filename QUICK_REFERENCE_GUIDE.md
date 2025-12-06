# 📖 Quick Reference Guide - File by File

## 🎯 Backend Files Quick Reference

### Root Level

| File | Purpose | Key Exports |
|------|---------|-------------|
| `server.js` | Main server file - starts everything | Express app, Socket.io server |
| `package.json` | Dependencies and scripts | npm commands |

### 📂 config/

| File | Purpose | What It Does |
|------|---------|--------------|
| `database.js` | Database connection | Creates MySQL connection pool |
| `initDatabase.js` | Database setup | Creates tables, inserts default data |

### 📂 controllers/

| File | Purpose | Main Functions |
|------|---------|----------------|
| `authController.js` | Admin login/signup | login(), register(), forgotPassword() |
| `customerAuthController.js` | Customer login/signup | Same as auth but for customers |
| `customersController.js` | Customer CRUD | getAll, getById, create, update, getVehicles |
| `ordersController.js` | Order management | getAll, create, update, addService |
| `employeesController.js` | Employee management | getAll, create, update, delete |
| `servicesController.js` | Service management | getAll, create, update, delete |
| `chatbotController.js` | AI chatbot | chatWithBot() |
| `recommendationsController.js` | Service suggestions | getServiceRecommendations() |

### 📂 routes/

| File | Purpose | API Endpoints |
|------|---------|---------------|
| `auth.js` | Admin auth routes | `/api/auth/login`, `/api/auth/signup` |
| `customerAuth.js` | Customer auth routes | `/api/customer-auth/login` |
| `customers.js` | Customer routes | `/api/customers`, `/api/customers/:id` |
| `orders.js` | Order routes | `/api/orders`, `/api/orders/:id` |
| `employees.js` | Employee routes | `/api/employees` |
| `services.js` | Service routes | `/api/services` |
| `chatbot.js` | Chatbot route | `/api/chatbot/chat` |
| `recommendations.js` | Recommendations | `/api/recommendations/vehicle/:id` |

### 📂 middleware/

| File | Purpose | What It Checks |
|------|---------|----------------|
| `auth.js` | Admin authentication | Validates admin JWT token |
| `customerAuth.js` | Customer authentication | Validates customer JWT token |

---

## 🎨 Frontend Files Quick Reference

### Root Level

| File | Purpose | What It Does |
|------|---------|--------------|
| `index.jsx` | App entry point | Renders React app, wraps providers |
| `index.css` | Global styles | CSS variables for theming |
| `App.jsx` | Main app component | Defines all routes, includes Toaster |

### 📂 api/

| File | Purpose | Main Functions |
|------|---------|----------------|
| `config.js` | Axios setup | Creates API instance with interceptors |
| `auth.js` | Auth API calls | adminAuthAPI, customerAuthAPI |
| `customers.js` | Customer API | getAll, getById, create, update |
| `orders.js` | Order API | getAll, create, update |
| `services.js` | Service API | getAll, create, update |
| `employees.js` | Employee API | getAll, create, update |
| `chatbot.js` | Chatbot API | chat() |
| `recommendations.js` | Recommendations API | getByVehicle() |
| `index.js` | Central export | Exports all APIs |

### 📂 components/

| File | Purpose | Key Features |
|------|---------|--------------|
| `Header.jsx` | Top navigation | Logo, nav links, theme toggle |
| `Footer.jsx` | Page footer | Contact info, links |
| `LoginForm.jsx` | Admin login | Email/password form |
| `SignupForm.jsx` | Admin signup | Registration form |
| `CustomerLoginForm.jsx` | Customer login | Customer login form |
| `CustomerSignupForm.jsx` | Customer signup | Customer registration |
| `AdminSidebar.jsx` | Admin navigation | Sidebar menu |
| `ThemeToggle.jsx` | Theme switcher | Dark/light mode button |
| `AIChatbot.jsx` | Chatbot UI | Floating chat interface |
| `ForgotPassword.jsx` | Password recovery | Reset password form |
| `ForgotUsername.jsx` | Username recovery | Get username form |

### 📂 pages/

| File | Purpose | What It Shows |
|------|---------|---------------|
| `HomePage.jsx` | Landing page | Hero, services, about, contact |
| `Dashboard.jsx` | Admin dashboard | Quick access cards, overview |
| `CustomersList.jsx` | Customer list | Table of all customers |
| `CustomerDetail.jsx` | Customer info | Customer details, vehicles, orders |
| `AddCustomer.jsx` | Add customer | Form to create customer |
| `EditCustomer.jsx` | Edit customer | Form to update customer |
| `AddVehicle.jsx` | Add vehicle (admin) | Form to add vehicle |
| `OrdersList.jsx` | Orders list | Table of all orders |
| `NewOrder.jsx` | Create order (admin) | Form to create order |
| `OrderDetail.jsx` | Order details | Full order information |
| `EmployeesList.jsx` | Employees list | Table of employees |
| `AddEmployee.jsx` | Add employee | Form to create employee |
| `EditEmployee.jsx` | Edit employee | Form to update employee |
| `ServicesList.jsx` | Services list | List of all services |
| `CustomerDashboard.jsx` | Customer dashboard | Vehicles, recommendations, orders |
| `CustomerAddVehicle.jsx` | Add vehicle (customer) | Customer form to add vehicle |
| `CustomerNewOrder.jsx` | Request service | Customer form to request service |

### 📂 contexts/

| File | Purpose | Provides |
|------|---------|----------|
| `ThemeContext.jsx` | Theme management | theme, toggleTheme, isDark |
| `SocketContext.jsx` | Real-time connection | socket, joinOrderRoom, isConnected |

---

## 🔄 Request Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTP Request (GET/POST/PUT/DELETE)
       │ + JWT Token in Header
       ▼
┌─────────────────┐
│  Express Server │
│   (server.js)   │
└──────┬──────────┘
       │
       ├─→ Route (routes/*.js)
       │   │
       │   ├─→ Middleware (auth.js) - Check token
       │   │
       │   └─→ Controller (controllers/*.js)
       │       │
       │       └─→ Database Query (config/database.js)
       │           │
       │           └─→ MySQL Database
       │
       └─→ Response (JSON)
           │
           ▼
┌─────────────┐
│   Browser   │
│  Updates UI │
└─────────────┘
```

---

## 🗄️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Admin accounts | id, email, password, name |
| `customers` | Customer accounts | id, email, password, first_name, last_name |
| `vehicles` | Customer vehicles | id, customer_id, make, model, year, mileage |
| `orders` | Service orders | id, customer_id, vehicle_id, status, total_amount |
| `services` | Available services | id, name, description |
| `order_services` | Order-Service links | order_id, service_id |
| `employees` | Staff members | id, email, password, first_name, last_name, role |

---

## 🔐 Authentication Flow

```
1. User enters email/password
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend creates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend includes token in all future requests
   ↓
7. Middleware checks token on protected routes
   - Valid token → Allow access
   - Invalid token → Return 401
```

---

## 📡 Real-Time Flow (Socket.io)

```
1. Frontend connects to Socket.io server
   ↓
2. Customer creates order
   ↓
3. Backend emits 'order:status' event
   ↓
4. All connected clients receive update
   ↓
5. Frontend shows toast notification
   ↓
6. Order list updates automatically
```

---

## 🎨 Theme System Flow

```
1. User clicks theme toggle
   ↓
2. ThemeContext.toggleTheme() called
   ↓
3. Theme state changes (light ↔ dark)
   ↓
4. Sets data-theme attribute on <html>
   ↓
5. CSS variables update automatically
   ↓
6. All components re-render with new colors
```

---

## 💡 Key JavaScript Concepts Used

### 1. **Async/Await**
```javascript
// Used for database queries and API calls
const data = await pool.execute('SELECT * FROM customers');
```

### 2. **Destructuring**
```javascript
// Extract values from objects/arrays
const { email, password } = req.body;
```

### 3. **Spread Operator**
```javascript
// Copy arrays/objects
const newArray = [...oldArray, newItem];
```

### 4. **Arrow Functions**
```javascript
// Shorthand function syntax
const handleClick = () => { /* code */ };
```

### 5. **Template Literals**
```javascript
// String interpolation
const message = `Hello, ${name}!`;
```

### 6. **Optional Chaining**
```javascript
// Safe property access
const name = customer?.first_name;
```

### 7. **React Hooks**
```javascript
// useState - Component state
const [count, setCount] = useState(0);

// useEffect - Side effects
useEffect(() => { /* code */ }, [dependencies]);

// useContext - Access context
const { theme } = useTheme();
```

---

## 🚀 Common Patterns

### Pattern 1: CRUD Operations
```javascript
// Create
POST /api/resource

// Read
GET /api/resource
GET /api/resource/:id

// Update
PUT /api/resource/:id

// Delete
DELETE /api/resource/:id
```

### Pattern 2: Protected Routes
```javascript
// Route with authentication
router.post('/', authenticate, controller.create);
```

### Pattern 3: Error Handling
```javascript
try {
  // Code that might fail
} catch (error) {
  // Handle error
  res.status(500).json({ message: 'Error' });
}
```

### Pattern 4: Loading States
```javascript
const [loading, setLoading] = useState(false);

setLoading(true);
await apiCall();
setLoading(false);
```

---

## 📝 Naming Conventions

- **Files**: camelCase (e.g., `LoginForm.jsx`)
- **Components**: PascalCase (e.g., `LoginForm`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: kebab-case (e.g., `login-form`)

---

## 🎓 Teaching Tips

1. **Start Simple**: Explain one file at a time
2. **Use Examples**: Show real code from the project
3. **Trace the Flow**: Follow a request from frontend to database
4. **Draw Diagrams**: Visual representation helps
5. **Ask Questions**: "What happens when you click login?"
6. **Practice**: Have them modify a simple file first

---

This guide gives you everything you need to explain the system to your classmate! 🎉

