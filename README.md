# Clinic Management System

A comprehensive clinic management system built with Kotlin/Spring Boot backend and React/TypeScript frontend for managing therapy sessions, client information, and personal therapy appointments.

## Features

### 🔐 Authentication & Security
- Secure JWT-based authentication
- User registration and login
- Protected routes and API endpoints
- CORS configuration for frontend-backend communication

### 👥 Client Management
- Add, edit, and manage therapy clients
- Store client information (name, email, phone, notes)
- Search functionality for finding clients
- Client activity tracking

### 📅 Meeting Management
- Schedule therapy sessions with clients
- Track meeting status (scheduled, completed, cancelled, no-show)
- Payment tracking for each session
- Monthly view of meetings

### 🏥 Personal Session Management
- Track your own therapy sessions
- Record therapist information
- Payment and session status tracking
- Separate from client sessions

### 📊 Dashboard & Analytics
- Overview of active clients
- Monthly revenue tracking
- Unpaid sessions overview
- Quick action buttons for common tasks

## Technology Stack

### Backend
- **Kotlin** - Primary programming language
- **Spring Boot 3.2** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - In-memory database for local development
- **JWT** - Token-based authentication
- **Gradle** - Build and dependency management

### Frontend
- **React 18** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **CSS3** - Modern styling with gradients and animations

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ClinicManagement
   ```

2. **Run the backend**
   ```bash
   ./gradlew bootRun
   ```
   
   The backend will start on `http://localhost:8085`

3. **Access H2 Database Console** (Development only)
   - URL: `http://localhost:8085/h2-console`
   - JDBC URL: `jdbc:h2:mem:clinic_db`
   - Username: `sa`
   - Password: `password`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

## Usage

### First Time Setup

1. **Register a new account**
   - Navigate to `http://localhost:3000`
   - Click "Register" on the login page
   - Fill in your details and create an account

2. **Login**
   - Use your credentials to log into the system
   - You'll be redirected to the dashboard

3. **Add your first client**
   - Use the "Add New Client" button on the dashboard
   - Fill in client information

4. **Schedule a meeting**
   - Use the "Schedule Meeting" button
   - Select client, date, time, and price

### Daily Operations

- **Dashboard**: Overview of your practice with quick stats
- **Client Management**: Add, edit, search, and manage clients
- **Meeting Scheduling**: Schedule and track therapy sessions
- **Payment Tracking**: Mark sessions as paid/unpaid
- **Personal Sessions**: Track your own therapy appointments

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/{id}` - Get client by ID
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Deactivate client
- `GET /api/clients/search?name={name}` - Search clients

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/{id}` - Get meeting by ID
- `PUT /api/meetings/{id}` - Update meeting
- `PATCH /api/meetings/{id}/payment` - Update payment status
- `DELETE /api/meetings/{id}` - Delete meeting
- `GET /api/meetings/month?year={year}&month={month}` - Get meetings by month

### Personal Meetings
- `GET /api/personal-meetings` - Get all personal meetings
- `POST /api/personal-meetings` - Create new personal meeting
- `GET /api/personal-meetings/{id}` - Get personal meeting by ID
- `PUT /api/personal-meetings/{id}` - Update personal meeting
- `PATCH /api/personal-meetings/{id}/payment` - Update payment status
- `DELETE /api/personal-meetings/{id}` - Delete personal meeting

## Database Schema

### Users
- `id` (Primary Key)
- `username` (Unique)
- `password` (Encrypted)
- `email`
- `full_name`
- `created_at`
- `is_enabled`

### Clients
- `id` (Primary Key)
- `full_name`
- `email`
- `phone`
- `date_of_birth`
- `notes`
- `user_id` (Foreign Key)
- `created_at`
- `is_active`

### Meetings
- `id` (Primary Key)
- `client_id` (Foreign Key)
- `user_id` (Foreign Key)
- `meeting_date`
- `duration`
- `price`
- `is_paid`
- `payment_date`
- `notes`
- `status`
- `created_at`

### Personal Meetings
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `therapist_name`
- `meeting_date`
- `duration`
- `price`
- `is_paid`
- `payment_date`
- `notes`
- `status`
- `created_at`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Protection**: Configured for frontend origin only
- **Input Validation**: Server-side validation for all inputs
- **Session Management**: Stateless authentication
- **Protected Routes**: Both frontend and backend route protection

## Development

### Adding New Features

1. **Backend**: Add new controllers, services, and repositories
2. **Frontend**: Create new components and update routing
3. **Database**: Update entities and repositories as needed

### Testing

- Backend tests: `./gradlew test`
- Frontend tests: `npm test` (in frontend directory)

## Production Deployment

### Backend
1. Build the JAR: `./gradlew build`
2. Configure PostgreSQL database
3. Update `application.yml` for production
4. Deploy to cloud service (AWS, Heroku, etc.)

### Frontend
1. Build for production: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API base URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for therapy practitioners to manage their practice efficiently.** 