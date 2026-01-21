# Real-Time Collaborative Data Dashboard

A full-stack application where users can upload CSV datasets, visualize them in interactive charts, and collaborate in real-time.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts, Socket.io Client
- **Backend:** Node.js, Express, Socket.io
- **Databases:** MongoDB (User Metadata), MySQL (Structured Data)

## Key Features
- **Secure Authentication:** JWT-based login and registration.
- **Data Pipeline:** Streams large CSV uploads directly into MySQL tables.
- **Interactive Analytics:** Dynamic bar charts with selectable X/Y axes.
- **Real-Time Collaboration:** Live user presence and cursor tracking using WebSockets.

## How to Run Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   nodemon server