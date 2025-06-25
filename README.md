# IIITA Helpdesk

This is a full-stack project for handling student complaints at IIITA. This guide walks you through setting up the MySQL database, configuring the environment, and running both the server and client.

---

## 🔧 Setup Instructions

### 1. Create MySQL Database

Open your MySQL terminal or GUI and run:

```sql
CREATE DATABASE iiita_helpdesk;
use iiita_helpdesk;
```
### 2. update .env file in server folder
```
# Run backend
cd server
npm install
npm run dev

# Run frontend
cd client
npm install
npm run dev
```

### Docker setup
some error is there, will fix it !
```
docker-compose up --build
```

## CLASS DIAGRAM
![Screenshot 2025-04-27 163356](https://github.com/user-attachments/assets/e10f681e-217a-4ec1-8155-5038b91f88fb)

## ER DIAGRAM
![Screenshot 2025-04-29 154637](https://github.com/user-attachments/assets/b8bb32d4-a715-4035-980b-1975431a44f2)

