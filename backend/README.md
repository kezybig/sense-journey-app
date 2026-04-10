# SenseJourney Backend

This is the backend service for SenseJourney (Escape Capsule) app, built with Go, Gin, and GORM.

## Prerequisites

- Go 1.25.0 or higher
- MySQL 5.7 or higher

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   cd backend
   go mod tidy
   ```

3. **Configure database**
   - Create a MySQL database named `sensejourney`
   - Update the database connection string in `config/database.go` if needed

4. **Run the server**
   ```bash
   go run main.go
   ```

## API Endpoints

### POST /api/login
- **Description**: Login with phone and password
- **Request Body**:
  ```json
  {
    "phone": "13800138000",
    "password": "your_password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "email": "user@example.com"
    }
  }
  ```

### POST /api/register
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "phone": "13800138000",
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Registration successful",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "email": "user@example.com"
    }
  }
  ```

### GET /api/user/:phone
- **Description**: Get user information by phone number
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "email": "user@example.com"
    }
  }
  ```

## Project Structure

```
backend/
├── api/            # API handlers
├── config/         # Configuration files
├── models/         # Database models
├── main.go         # Main application
├── go.mod          # Go module file
└── README.md       # This file
```

## Features

- User registration and login
- Password encryption using bcrypt
- JWT token generation (to be implemented)
- Cross-origin resource sharing (CORS) support
- Database auto-migration
