# Task Management App

A simple full-stack app for managing tasks. Features user registration, login/logout, CRUD for tasks, filtering, and sorting. Built with React, Node.js, Express, MongoDB, and JWT authentication. Design is intentionally basic for beginners.

## Structure
- `client/` - React frontend
- `server/` - Node.js Express backend
- `.vscode/` - VS Code tasks for easy development

## Features
- ✅ User registration and login/logout
- ✅ JWT-based authentication
- ✅ Create, read, update, delete tasks
- ✅ Filter tasks by text
- ✅ Sort tasks alphabetically
- ✅ Responsive design for mobile and desktop
- ✅ In-memory MongoDB fallback for development

## Tech Stack
- **Frontend**: React, CSS, HTML
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (with in-memory fallback)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcrypt hashing

## Deployment
- Backend: Render (using `render.yaml`)
- Frontend: Netlify (using `netlify.toml`)

## Setup
1. Install dependencies in both `client` and `server` folders:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Configure environment variables (see `ENVIRONMENT.md` for details):
   - Server: Create `server/.env` with `MONGO_URI` and `JWT_SECRET`
   - Client: Optionally set `REACT_APP_API_URL` in `client/.env`

3. Start the servers:
   - Backend: `cd server && npm start` (runs on port 5000 by default)
   - Frontend: `cd client && npm start` (runs on port 3000 by default)

## VS Code Users
Use the included tasks:
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Backend Server"
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Frontend Client" 
