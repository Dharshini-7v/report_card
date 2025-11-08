# Student Report System

A comprehensive web-based student report management system that allows teachers to create, process, and manage student reports with grade calculations, statistics, and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure login and signup system with password hashing
- **Report Entry**: Create and process student reports with multiple subjects
- **Grade Calculation**: Automatic calculation of:
  - Student averages
  - Letter grades (A+, A, B, C, F)
  - Best subject identification
  - Personalized remarks
- **Dashboard**: Comprehensive overview with:
  - Class average statistics
  - Grade distribution summary
  - Complete student results table
- **Profile Management**: User profile with statistics and account information
- **Multi-threaded Processing**: Efficient parallel processing of student reports

### User Interface
- Modern, responsive design with gradient backgrounds
- Intuitive navigation with menu bar
- Real-time data updates
- Clean and professional UI/UX
- Mobile-friendly responsive design

## 🛠 Technology Stack

### Backend
- **Java 17+**: Core programming language
- **Spark Framework**: Lightweight web framework for REST API
- **Gson**: JSON processing library
- **PostgreSQL**: Database (optional, uses in-memory storage as fallback)
- **Jetty**: Embedded web server

### Frontend
- **HTML5**: Structure
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Client-side functionality
- **Fetch API**: For REST API communication

## 📁 Project Structure

```
StudentReportSystem/
├── backend/
│   ├── src/
│   │   ├── Main.java              # Application entry point and routes
│   │   ├── AuthHandler.java       # Authentication and user management
│   │   ├── DatabaseConnector.java # Database operations (with in-memory fallback)
│   │   ├── ReportModel.java       # Data models for reports and students
│   │   ├── ReportProcessor.java   # Multi-threaded report processing
│   │   └── UserModel.java         # User data model
│   ├── lib/                       # JAR dependencies
│   ├── resources/
│   │   └── config.properties      # Configuration file
│   └── build.gradle               # Build configuration
├── frontend/
│   ├── index.html                  # Login page
│   ├── signup.html                 # Registration page
│   ├── dashboard.html              # Dashboard with statistics
│   ├── reportEntry.html           # Report entry form
│   ├── profile.html                # User profile page
│   └── assets/
│       ├── style.css               # Stylesheet
│       └── script.js              # Client-side JavaScript
├── database/
│   ├── create_tables.sql          # Database schema
│   └── sample_data.sql            # Sample data (optional)
├── api_tests/                      # HTTP test files
└── README.md                       # This file
```

## 📋 Prerequisites

Before running the application, ensure you have:

- **Java Development Kit (JDK) 17 or higher**
  - Download from: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
  - Verify installation: `java -version`

- **PostgreSQL (Optional)**
  - Required only if you want persistent database storage
  - Download from: [PostgreSQL Downloads](https://www.postgresql.org/download/)
  - The application works with in-memory storage if PostgreSQL is not available

## 🚀 Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd StudentReportSystem
   ```

2. **Navigate to the backend directory**
   ```bash
   cd backend/src
   ```

3. **Compile the Java files**
   ```bash
   javac -cp "../lib/*" *.java
   ```

   This compiles all Java source files with the required dependencies from the `lib` folder.

## ⚙️ Configuration

### Backend Configuration

Edit `backend/resources/config.properties`:

```properties
# Server Configuration
server.port=4567

# Database Configuration (Optional)
# Leave as is if using in-memory storage
db.driver=org.postgresql.Driver
db.url=jdbc:postgresql://localhost:5432/reportdb
db.user=postgres
db.pass=your_password
```

**Note**: The application works without PostgreSQL using in-memory storage. Database connection is optional.

### Database Setup (Optional)

If you want to use PostgreSQL:

1. **Create the database**
   ```sql
   CREATE DATABASE reportdb;
   ```

2. **Run the schema script**
   ```bash
   psql -U postgres -d reportdb -f database/create_tables.sql
   ```

3. **Update config.properties** with your database credentials

## 🏃 Running the Application

### Start the Server

1. **Navigate to backend source directory**
   ```bash
   cd backend/src
   ```

2. **Run the application**
   ```bash
   java -cp ".;../lib/*" Main
   ```

   For Unix/Linux/Mac:
   ```bash
   java -cp ".:../lib/*" Main
   ```

3. **Verify server is running**
   - You should see: `Server started at http://localhost:4567`
   - Open your browser and navigate to: `http://localhost:4567`

### Access the Application

- **Login Page**: `http://localhost:4567/index.html`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `1234`

### Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/signup` | Create new user account | `{"username": "string", "password": "string", "dept": "string"}` |
| POST | `/login` | User login | `{"username": "string", "password": "string"}` |

### Reports

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/processReport` | Process student reports | `{"students": [{"name": "string", "marks": [int]}]}` |
| GET | `/summary` | Get summary statistics | - |
| GET | `/students` | Get all student results | - |

### Example API Request

**Process Report:**
```json
POST /processReport
Content-Type: application/json

{
  "students": [
    {
      "name": "John Doe",
      "marks": [85, 90, 88, 92, 87]
    },
    {
      "name": "Jane Smith",
      "marks": [78, 82, 80, 85, 79]
    }
  ]
}
```

**Response:**
```json
{
  "students": [
    {
      "name": "John Doe",
      "average": 88.4,
      "grade": "A",
      "bestSubject": "Subject 4",
      "remark": "Very Good",
      "marks": [85, 90, 88, 92, 87]
    }
  ],
  "summary": {
    "classAverage": 83.2,
    "gradeCounts": {
      "A": 1,
      "B": 1
    }
  }
}
```

## 📖 Usage Guide

### 1. Login
- Navigate to `http://localhost:4567`
- Enter your username and password
- Click "Login" or use default credentials: `admin` / `1234`

### 2. Create Reports
- Click on **"Report Entry"** in the menu bar
- Enter the number of subjects and students
- Click **"Generate Form"**
- Fill in student names and marks for each subject
- Click **"Process Reports"** to calculate grades

### 3. View Dashboard
- Click on **"Dashboard"** in the menu bar
- View summary statistics:
  - Class average
  - Grade distribution
  - Complete student results table

### 4. Profile
- Click on **"Profile"** in the menu bar
- View your account information and statistics

### Grade Calculation

The system automatically calculates:
- **Average**: Sum of all marks divided by number of subjects
- **Grade**: 
  - A+: 90% and above
  - A: 75% - 89%
  - B: 60% - 74%
  - C: 50% - 59%
  - F: Below 50%
- **Remark**: Based on average performance
- **Best Subject**: Subject with highest marks

## 🗄️ Database Setup

### Using PostgreSQL (Optional)

1. **Install PostgreSQL** and ensure it's running

2. **Create database**
   ```sql
   CREATE DATABASE reportdb;
   ```

3. **Run schema**
   ```bash
   psql -U postgres -d reportdb -f database/create_tables.sql
   ```

4. **Update configuration** in `backend/resources/config.properties`

### Using In-Memory Storage (Default)

The application automatically uses in-memory storage if:
- PostgreSQL is not running
- Database connection fails
- No database configuration is provided

**Note**: Data stored in memory will be lost when the server stops.

## 🔧 Troubleshooting

### Server Won't Start

1. **Check Java version**
   ```bash
   java -version
   ```
   Ensure you have Java 17 or higher

2. **Check port availability**
   - Ensure port 4567 is not in use
   - Change port in `config.properties` if needed

3. **Verify compilation**
   - Ensure all `.class` files are present in `backend/src`
   - Recompile if necessary: `javac -cp "../lib/*" *.java`

### Database Connection Issues

- **Error**: "Connection to localhost:5432 refused"
  - **Solution**: This is normal if PostgreSQL is not running
  - The application will use in-memory storage automatically
  - Check console for: `[INFO] Using in-memory storage for reports`

### Frontend Not Loading

1. **Check server is running**
   - Verify: `Server started at http://localhost:4567`

2. **Check browser console**
   - Open Developer Tools (F12)
   - Look for JavaScript errors

3. **Verify file paths**
   - Ensure frontend files are in the `frontend` directory
   - Check static file serving in console logs

### API Endpoints Not Working

1. **Check server logs**
   - Look for route mapping errors
   - Verify endpoints are registered

2. **Test with curl**
   ```bash
   curl http://localhost:4567/summary
   ```

3. **Check CORS** (if accessing from different origin)
   - The application serves static files from the same origin

## 📝 Development Notes

### Adding New Features

1. **Backend**: Add new routes in `Main.java`
2. **Frontend**: Update `script.js` for client-side functionality
3. **Styling**: Modify `style.css` for UI changes

### Dependencies

All required JAR files are included in `backend/lib/`:
- spark-core-2.9.4.jar
- gson-2.10.1.jar
- postgresql-42.7.3.jar
- Jetty server libraries
- SLF4J logging libraries

### Build System

The project uses a simple Java compilation setup. For production, consider:
- Using Gradle or Maven for dependency management
- Setting up proper build scripts
- Implementing CI/CD pipelines



---

**Happy Reporting! 📊**
