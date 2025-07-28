# Clinic Management System

A comprehensive clinic management system built with Spring Boot (Kotlin) and React.

## Database Setup

### Local Development (MySQL)

1. **Install MySQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install mysql
   
   # Ubuntu/Debian
   sudo apt-get install mysql-server
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Start MySQL Service**:
   ```bash
   # macOS
   brew services start mysql
   
   # Ubuntu/Debian
   sudo systemctl start mysql
   
   # Windows
   # Start MySQL service from Services
   ```

3. **Create Database**:
   ```bash
   mysql -u root -p
   ```
   Then in MySQL:
   ```sql
   CREATE DATABASE clinic_db;
   CREATE USER 'clinic_user'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON clinic_db.* TO 'clinic_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Update Application Configuration** (if needed):
   Edit `src/main/resources/application.yml` and update the database credentials:
   ```yaml
   datasource:
     url: jdbc:mysql://localhost:3306/clinic_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
     username: clinic_user  # or root
     password: password     # your MySQL password
   ```

## Running the Application

### Backend (Spring Boot)

1. **Build the project**:
   ```bash
   ./gradlew clean build
   ```

2. **Run the application**:
   ```bash
   ./gradlew bootRun
   ```

The backend will start on `http://localhost:8085`

### Frontend (React)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Default Admin User

When the application starts for the first time, it creates a default admin user:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## API Documentation

The application provides the following main endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login

### Admin Functions
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/{id}/approve` - Approve user
- `POST /api/admin/users/{id}/reject` - Reject user
- `PUT /api/admin/users/{id}` - Update user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Client Management
- `GET /api/clients` - Get user's clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client

### Meeting Management
- `GET /api/meetings` - Get user's meetings
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/{id}` - Update meeting

## Testing

Use the provided Postman collection `testing/ClinicManagement_TestCollection.postman_collection.json` to test the API endpoints and seed test data.

## Production Deployment

The application is configured for deployment on Railway with MySQL. The production profile automatically enables Flyway migrations for database schema management. 