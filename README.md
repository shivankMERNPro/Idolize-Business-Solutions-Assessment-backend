# Node Boilerplate 🚀

Node Boilerplate is a production-ready backend starter built with Node.js, Express, and TypeScript, designed to follow real-world engineering practices rather than demo-level setups.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Features](#project-features)
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Scripts](#scripts)  
- [Development Guidelines](#development-guidelines)  
- [Linting & Formatting](#linting--formatting)

---
  
## Project Overview

This project is designed to manage **user profiles** efficiently with:

- Design database schema for student records
- Implement RESTful CRUD APIs using Node.js
- Add pagination logic to retrieve students
- Test APIs using Postman or similar tools

---

## ✨ Features

- ⚡ Express + TypeScript setup
- 🔐 Security headers with Helmet
- 🚦 Rate limiting to prevent abuse
- 🌐 Custom CORS middleware
- 🧾 Request logging
- 🧩 Modular folder structure
- ❤️ Health check APIs (Service + MongoDB)
- ❗ Centralized & global error handling
- 🔄 Graceful shutdown & process-level safety

---

## Tech Stack
- Node.js
- TypeScript
- Express.js
- MongoDB
- Zod (Validation)
- dotenv
- Morgan (Logging)
- Helmet (Security)
- CORS

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shivankMERNPro/Node-Boilerplate.git
```
```bash
cd Node-Boilerplate.git
```

```bash
npm install
```

---

## Available Scripts

### `npm run dev`
Starts the server in development mode with auto-reload on code changes.

```bash
npm run dev 
```

### `npm run build`
Compiles the TypeScript source code into JavaScript for production.
```bash
npm run build   
```

### `npm run start`
Runs the compiled production build.
```bash
npm run start  
```

### `npm run format:check`
Checks code formatting without making changes.
```bash
npm run format:check
```

### `npm run format:fix`
Automatically fixes formatting issues using Prettier.
```bash
npm run format:fix   
```

### `npm run prepare`
Sets up Husky Git hooks (runs automatically after install).
```bash
npm run prepare    
```

