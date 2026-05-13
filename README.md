# Log Activity Management System

## Project Overview
A full-stack Log Activity Management System built with React.js, Node.js, Express, and PostgreSQL. It features role-based access for Students and Admins, JWT authentication, and a modern responsive UI powered by Tailwind CSS.

## Features
- **Student Role**: Register, login, create/edit/delete/view activity logs, view admin comments and reactions.
- **Admin Role**: Login, view all students, view all student logs, search/filter logs, add comments, add reactions (👍, ⭐, ✅, 🔥).

---

## Local Setup Instructions

### 1. Database Setup
1. Ensure you have PostgreSQL installed.
2. Create a database named `logactivity`:
   ```sql
   CREATE DATABASE logactivity;
   ```
3. Update the `backend/.env` file with your PostgreSQL credentials (e.g. password).

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *(The server will automatically create the required database tables on the first run).*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```

---

## AWS EC2 Deployment Architecture

### Prerequisites
- AWS EC2 Ubuntu instance
- Security Group configured to allow Inbound ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend API).

### 1. Install Node.js, PostgreSQL, and Nginx
```bash
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib nginx -y
```

### 2. Configure PostgreSQL
```bash
sudo -u postgres psql
```
```sql
ALTER USER postgres PASSWORD 'yourpassword';
CREATE DATABASE logactivity;
\q
```

### 3. Setup Project
1. Clone your repository to `/var/www/logactivity`.
2. Setup Backend:
   ```bash
   cd /var/www/logactivity/backend
   npm install
   sudo npm install -g pm2
   pm2 start server.js --name log-backend
   pm2 save
   pm2 startup
   ```

### 4. Setup Frontend
1. Build the React app:
   ```bash
   cd /var/www/logactivity/frontend
   npm install
   npm run build
   ```

### 5. Configure Nginx
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/logactivity
```
Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    # Serve React Frontend
    location / {
        root /var/www/logactivity/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy for Node.js Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/logactivity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Your Log Activity Management System is now deployed and running on AWS EC2!
