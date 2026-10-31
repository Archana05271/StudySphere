# Student Course Management and Learning Progress Tracking System

## Project Overview

The **Student Course Management and Learning Progress Tracking System** is a full-stack web application designed to streamline academic course enrollment and learning management. The system allows students to create accounts, browse available courses, enroll in courses, access course materials, track their learning progress, and receive updates regarding their courses.

The application also provides administrators with tools to manage students, courses, enrollments, and progress reports.

This project demonstrates key concepts in Full Stack Web Development, including frontend development, backend APIs, database management, authentication, deployment, and application security.

---

## Problem Statement

In many educational institutions, students face challenges such as:

- Finding available courses
- Registering for courses efficiently
- Monitoring learning progress
- Accessing course information in one place
- Tracking completed and pending modules

Similarly, administrators often encounter difficulties in managing course enrollments and monitoring student performance.

This system addresses these challenges by providing a centralized web-based platform for academic course management and progress tracking.

---

## Project Objectives

- Provide secure student registration and login.
- Allow students to browse and enroll in available courses.
- Enable administrators to create and manage courses.
- Track student learning progress.
- Generate progress reports.
- Provide real-time notifications and updates.
- Maintain secure access to academic data.

---

## User Roles

### Student

Students can:

- Register and log in
- View their profile
- Browse available courses
- Enroll in courses
- Access course content
- Track learning progress
- View course completion percentage
- Receive notifications

### Administrator

Administrators can:

- Log in securely
- Add, edit, and delete courses
- Manage student records
- Monitor enrollments
- Generate reports
- Update course content
- View analytics dashboards

---

## System Modules

### Module 1: User Authentication

#### Features

- Student Registration
- Student Login
- Password Encryption
- Forgot Password
- JWT Authentication

#### Database Fields

| Field | Type |
|--------|------|
| Student ID | Integer |
| Name | String |
| Email | String |
| Password | Encrypted String |
| Department | String |

---

### Module 2: Course Management

#### Features

- Add Course
- Update Course
- Delete Course
- View Course Details

#### Course Information

| Field | Description |
|--------|-------------|
| Course ID | Unique ID |
| Course Name | Course Title |
| Instructor | Faculty Name |
| Duration | Number of Weeks |
| Description | Course Information |
| Category | Programming, AI, Web, etc. |

---

### Module 3: Course Enrollment

#### Features

- Browse Courses
- Search Courses
- Enroll in Course
- View Enrolled Courses

#### Workflow

```
Student Login
      ↓
Browse Courses
      ↓
Select Course
      ↓
Enroll
      ↓
Confirmation
```

---

### Module 4: Learning Management

#### Features

- View Modules
- Access Learning Materials
- Mark Module as Completed
- Continue Learning

#### Example Course Structure

**Course:** Full Stack Development

Modules:

- HTML
- CSS
- JavaScript
- React
- Node.js
- MongoDB

Students complete each module sequentially while their progress is automatically recorded.

---

### Module 5: Progress Tracking

#### Features

- Completion Percentage
- Course Progress Bar
- Completed Modules
- Pending Modules

#### Example

| Course | Progress |
|---------|----------|
| Python | 80% |
| React | 60% |
| DBMS | 100% |

---

### Module 6: Dashboard

#### Student Dashboard

Displays:

- Total Courses Enrolled
- Courses Completed
- Ongoing Courses
- Progress Statistics

#### Administrator Dashboard

Displays:

- Total Students
- Total Courses
- Active Enrollments
- Completion Reports

---

### Module 7: Notifications

#### Features

- New Course Alerts
- Enrollment Confirmation
- Assignment Reminders
- Completion Certificates

#### Real-Time Communication

- WebSockets
- Socket.IO

---

## Database Design

### Students Table

| Field |
|--------|
| student_id |
| name |
| email |
| password |
| department |

### Courses Table

| Field |
|--------|
| course_id |
| course_name |
| instructor |
| duration |
| description |

### Enrollment Table

| Field |
|--------|
| enrollment_id |
| student_id |
| course_id |
| enrollment_date |

### Progress Table

| Field |
|--------|
| progress_id |
| student_id |
| course_id |
| completed_modules |
| progress_percentage |

---

## Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML5, CSS3, Bootstrap, JavaScript, React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| Real-Time Communication | Socket.IO |
| API Testing | Postman |
| Version Control | Git, GitHub |
| Deployment | Render / Vercel / Railway |

---

## Project Highlights

- Secure user authentication using JWT and bcrypt
- Course browsing and enrollment system
- Learning progress monitoring
- Administrator management dashboard
- Real-time notifications using Socket.IO
- MongoDB database integration
- RESTful API architecture
- Responsive user interface
- Deployment-ready full-stack application

## Project Links
- GitHub: https://github.com/Archana05271/StudySphere
- Frontend (Vercel): https://study-sphere-seven-lemon.vercel.app/
- Backend (Render): https://studysphere-backend-8z2i.onrender.com