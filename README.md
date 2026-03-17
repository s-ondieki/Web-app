# Great Gorilla Tours App - Project Structure

## Directory Organization

### `/frontend`
Contains all frontend files:
- **HTML files**: index.html, login.html, register.html, plan.html, contact.html, destination.html, home.html, safaris.html
- **components/**: header.js, footer.js (reusable UI components)
- **assets/**: Images and static resources
- **package.json**: Frontend dependencies

### `/backend`
Contains all backend server code:
- **server.js**: Express server with API endpoints for login, registration, and travel plans
- **database.js**: Database module for user authentication and data persistence
- **package.json**: Backend dependencies (Express.js, etc.)

## How They Work Together

1. **Frontend** (Port 8000): Serves static HTML, CSS, and JavaScript files
2. **Backend** (Port 3000): Handles API requests and database operations

The backend Express server:
- Serves static frontend files from `../frontend` directory
- Processes form submissions from the frontend
- Handles authentication (login/register)
- Manages travel plan submissions

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server will run at http://localhost:3000

### Frontend 
Access the app at http://localhost:3000 (served by backend server)

## API Endpoints

- `POST /login` - User login
- `POST /register` - User registration  
- `POST /save-plan` - Save travel plan
- `GET /login.html` - Login page
- Static files served from `/` - All HTML and assets
