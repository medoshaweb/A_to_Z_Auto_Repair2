# ABE Garage - Full Stack Application

A full-stack web application for ABE Garage with React frontend and Node.js/Express backend with MySQL database.

## Features

- Modern, responsive design matching the ABE Garage branding
- User authentication (Login/Register)
- Secure password hashing with bcrypt
- JWT token-based authentication
- MySQL database integration
- RESTful API endpoints

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MySQL2
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── initDatabase.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Header.css
│   │   │   ├── LoginForm.js
│   │   │   ├── LoginForm.css
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=abe_garage
JWT_SECRET=your_jwt_secret_key_here
```

5. Make sure MySQL is running and create the database (it will be created automatically on first run).

6. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` (Vite will automatically open the browser)

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: JWT token and user data

- `POST /api/auth/register` - Register new user
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`
  - Returns: JWT token and user data

- `GET /api/auth/me` - Get current user (requires Authorization header)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User data

### Health Check

- `GET /api/health` - Server health check

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Use the login form to authenticate
4. For testing, you can register a new user via the API or create one directly in the database

## Database Schema

### Users Table
- `id` - INT (Primary Key, Auto Increment)
- `email` - VARCHAR(255) (Unique)
- `password` - VARCHAR(255) (Hashed)
- `name` - VARCHAR(255)
- `created_at` - TIMESTAMP

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- CORS enabled for frontend-backend communication
- Environment variables for sensitive data

## Development

- Backend uses nodemon for auto-reload during development
- Frontend uses Vite with HMR (Hot Module Replacement) for fast development
- Make sure to keep `.env` files out of version control

## License

ISC

