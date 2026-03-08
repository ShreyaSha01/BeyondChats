# BeyondChats Gmail Integration Dashboard

A modern **Gmail integration dashboard** built for the BeyondChats assignment.

The application allows users to connect their Gmail account, sync email conversations, view threads in a chat-style interface, and reply to emails directly from the dashboard.

In addition to the required functionality, the dashboard includes **thread summarization** and **thread search** to improve usability.

---

# Tech Stack

## Frontend
- React (Vite)
- Axios
- Custom CSS (Responsive Design)

## Backend
- Laravel
- Gmail API (Google OAuth 2.0)

## Database
- MySQL

## Containerization
- Docker (Laravel Sail)

---

# Project Structure

```
BeyondChats/
│
├── beyondchat-frontend/      # React Dashboard
│
└── beyondchat-backend/       # Laravel Backend (Docker + Sail)
```

---

# Features

## Gmail Integration
- Connect Gmail account using **Google OAuth**
- Secure authentication flow

## Email Sync
- User selects how many **days of emails** to sync
- Backend fetches emails using **Gmail API**
- Emails are stored in the database

## Chat-style Email Dashboard
- View **email threads**
- Expand conversations
- Email body rendered with full formatting

## Email Details
- Sender and receiver information
- Email timestamps
- Attachments support

## Reply to Emails
- Reply directly from the dashboard
- Replies are sent through Gmail API
- Messages appear in the same Gmail thread

---

# Additional Features (Innovation)

To add value beyond the base requirements, the following features were implemented:

### Thread Search
Users can search for threads using subject keywords to quickly find conversations.

### Thread Summarization
Each thread displays a short summary generated from the email content to help users quickly understand the conversation.

### Improved UI
- Chat-style conversation layout
- Smooth scrolling thread view
- Modern dashboard styling

### Responsive Layout
The UI adapts to different screen sizes.

Desktop layout:

```
Threads | Conversation
```

Mobile layout:

```
Threads
↓
Conversation
```

---

# Prerequisites

Install the following tools:

- Docker
- Node.js (v18 or later)
- npm

**Note:**  
PHP and Composer do not need to be installed locally because the backend runs inside Docker.

---

# Backend Setup (Laravel)

Navigate to the backend directory:

```
cd beyondchat-backend
```

Copy the environment file:

```
cp .env.example .env
```

Install backend dependencies using Docker Composer:

```
docker run --rm \
-u $(id -u):$(id -g) \
-v $(pwd):/app \
-w /app \
composer install
```

Start Laravel Sail containers:

```
./vendor/bin/sail up -d
```

Run database migrations:

```
./vendor/bin/sail artisan migrate
```

Backend will be available at:

```
http://localhost
```

---

# Frontend Setup (React)

Open a new terminal and navigate to the frontend folder:

```
cd beyondchat-frontend
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

# Running the Project

Start backend:

```
cd beyondchat-backend
./vendor/bin/sail up -d
```

Start frontend:

```
cd beyondchat-frontend
npm run dev
```

Access the application:

Frontend:
```
http://localhost:5173
```

Backend API:
```
http://localhost
```

---

# Gmail API Configuration

Add the following values to `.env` in the backend:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost/api/auth/google/callback
```

Steps to obtain credentials:

1. Open **Google Cloud Console**
2. Enable **Gmail API**
3. Create **OAuth 2.0 Client ID**
4. Add redirect URI:

```
http://localhost/api/auth/google/callback
```

5. Add your Gmail account as a **test user**

---

# Architecture / Data Flow

The system architecture follows a simple flow where the React frontend communicates with the Laravel backend, which interacts with Gmail API and the MySQL database.

```
User
 │
 ▼
React Dashboard
 │
 │ REST API
 ▼
Laravel Backend
 │
 ├── Gmail API (Fetch & Send Emails)
 │
 ▼
MySQL Database
```

---

# Database Schema

## Threads

| Column | Description |
|------|-------------|
| id | Internal thread id |
| thread_id | Gmail thread id |
| subject | Email subject |

---

## Emails

| Column | Description |
|------|-------------|
| id | Internal email id |
| thread_id | Gmail thread id |
| message_id | Gmail message id |
| from | Sender email |
| to | Receiver email |
| body_html | Email HTML content |
| sent_at | Email timestamp |

---

## Attachments

| Column | Description |
|------|-------------|
| id | Attachment id |
| email_id | Linked email |
| filename | Attachment name |
| mime_type | Attachment MIME type |
| attachment_id | Gmail attachment identifier (stored as text) |
| size | Attachment size in bytes |
| created_at | Record creation timestamp |
| updated_at | Record update timestamp |

---

# Demo Video

A walkthrough demonstrating all features is available here:

**Google Drive Video Link**

```
https://drive.google.com/drive/folders/1KNscxi28zDb9UrFtZWKZ-kgE7kadDuix?usp=sharing
```

The demo includes:

- Gmail authentication
- Email syncing
- Viewing email threads
- Thread search
- Thread summarization
- Replying to emails
- Attachments
- Responsive UI

---

# Author

**Shreya Sharma**

---

# Notes

This project was developed as part of the **BeyondChats Full Stack Developer assignment**.

The goal was to build a functional Gmail dashboard while maintaining clean architecture, responsive UI, and scalable backend design.