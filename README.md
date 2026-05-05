# 🎓 Idolize Business Solutions — Node.js Boilerplate

> A **production-ready**, security-hardened **Node.js + JavaScript + Express + MongoDB** REST API boilerplate featuring layered security middleware, JWT authentication with replay-attack prevention, CSRF protection, rate limiting, and full input validation.

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?logo=node.js)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v8-47A248?logo=mongodb)](https://mongoosejs.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Security Architecture](#-security-architecture)
- [Libraries & Use Cases](#-libraries--use-cases)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Available Scripts](#-available-scripts)
- [API Reference with cURL](#-api-reference-with-curl)
- [Data Models](#-data-models)
- [Middleware Execution Order](#-middleware-execution-order)
- [Code Quality Tools](#-code-quality-tools)

---

## 🚀 Project Overview

This project is a **Student Management System API** built as a secure, production-ready boilerplate. It provides RESTful endpoints for full CRUD operations on student records with pagination support.

**Key capabilities:**
- 🔐 Multi-layer security middleware stack (Helmet, CORS, CSRF, Rate Limiting, NoSQL Injection, HPP)
- 🔑 JWT authentication with **replay-attack prevention** via JTI blacklist
- ✅ Schema-based input validation with **Zod** (blocks XSS, invalid data, HTML injection)
- 📄 Paginated student listing — latest records first
- 🛡️ Express 5 compatible custom MongoDB injection sanitizer
- 📊 Structured colored logging with **Winston** + **Chalk**
- 🔄 Auto-retry MongoDB connection with graceful process shutdown

---

## 🛠 Tech Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | v22+ |
| Language | JavaScript | ES2022 |
| Framework | Express.js | ^5.1 |
| Database | MongoDB (via Mongoose) | ^8.19 |
| Validation | Zod | ^4.1 |
| Authentication | JSON Web Tokens (JWT) | ^9.0 |
| Security | Helmet, csrf-csrf, hpp, express-mongo-sanitize | Latest |
| Rate Limiting | express-rate-limit | ^8.1 |
| Logging | Winston, Morgan, Chalk | Latest |
| Password Hashing | bcrypt / bcryptjs | ^6.0 |
| Dev Tools | Nodemon, Prettier, Husky, lint-staged | Latest |

---

## 📁 Project Structure

```
Node-Boilerplate/
├── src/
│   ├── server.js                   # App entry point — middleware stack + server bootstrap
│   ├── app.js                      # Route mounting — /api/v1 prefix
│   │
│   ├── configs/
│   │   └── dbConnectionConfig.js   # MongoDB connection with retry logic + event listeners
│   │
│   ├── constants/
│   │   ├── env.js                  # Env variable loader + runtime validation (fail-fast)
│   │   └── httpStatus.js           # HTTP status code constants
│   │
│   ├── controllers/
│   │   └── student.controller.js   # Request handlers — CRUD for students
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT auth + JTI blacklist (replay-attack prevention)
│   │   ├── cors.middleware.js       # CORS — origin whitelist via env
│   │   ├── csrf.middleware.js       # CSRF protection — Double Submit Cookie Pattern
│   │   ├── helmet.middleware.js     # Security HTTP headers (CSP, HSTS, XSS, etc.)
│   │   ├── logger.middleware.js     # HTTP request logging via Morgan
│   │   ├── rateLimit.middleware.js  # Global + auth + custom rate limiters
│   │   ├── sanitize.middleware.js   # NoSQL injection + HPP protection (Express 5 safe)
│   │   └── validateRequest.middleware.js  # Zod schema validation factory
│   │
│   ├── models/
│   │   └── student.model.js        # Mongoose schema — name, email, age + timestamps
│   │
│   ├── routes/
│   │   └── student.routes.js       # RESTful routes — POST/GET/PUT/DELETE /student
│   │
│   ├── services/
│   │   └── student.service.js      # Business logic — DB operations
│   │
│   ├── utils/
│   │   ├── logger.js               # Colored console logger using Chalk
│   │   └── sendResponse.js         # Consistent API response helper
│   │
│   └── validationSchemas/
│       └── student.schema.js       # Zod schemas — createStudentSchema, updateStudentSchema
│
├── .env                            # Environment variables (never commit)
├── .prettierrc.json                # Prettier config
├── package.json
└── README.md
```

---

## 🔐 Security Architecture

This project implements a **9-layer security stack** applied in a deliberate, ordered sequence. Order matters — each layer protects the layers that follow it.

```
Incoming Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  [1] Helmet — Security HTTP Response Headers        │ ← First: protects ALL responses
│      CSP, HSTS, X-Frame-Options, noSniff, XSS       │
├─────────────────────────────────────────────────────┤
│  [2] CORS — Origin Whitelist                        │ ← Block unauthorized origins early
│      Trusted origins only, credentials supported    │
├─────────────────────────────────────────────────────┤
│  [3] Rate Limiter — Flood / Brute-force Guard       │ ← 100 req/15min/IP globally
│      Auth routes: 5 failed attempts/15min           │
├─────────────────────────────────────────────────────┤
│  [4] Morgan — HTTP Request Logger                   │ ← Log before body parsing
├─────────────────────────────────────────────────────┤
│  [5] Body Parser — 10kb size limit                  │ ← Blocks payload bomb attacks
│      JSON + URL-encoded                             │
├─────────────────────────────────────────────────────┤
│  [6] Mongo Sanitize — NoSQL Injection Guard         │ ← After body parsed
│      Strips $ and . operators from body/params/query│
├─────────────────────────────────────────────────────┤
│  [7] HPP — HTTP Parameter Pollution Guard           │ ← Cleans duplicate query params
│      Whitelist: fields, sort, populate              │
├─────────────────────────────────────────────────────┤
│  [8] Cookie Parser                                  │ ← Required BEFORE CSRF
├─────────────────────────────────────────────────────┤
│  [9] CSRF Protection (Double Submit Cookie Pattern) │ ← Guards POST/PUT/DELETE
│      GET/HEAD/OPTIONS are exempt                    │
└─────────────────────────────────────────────────────┘
      │
      ▼
  Application Routes → Zod Validation → Controller → MongoDB
```

### Security Features Explained

| Threat | Protection | Implementation |
|---|---|---|
| **XSS** | CSP headers + Zod NoHTML validator | `helmet` + `student.schema.js` |
| **CSRF Attack** | Double Submit Cookie Pattern | `csrf-csrf` library |
| **Replay Attack** | JWT JTI Blacklist (in-memory Set) | `auth.middleware.js` |
| **Brute Force / DDoS** | Rate Limiting (Global + Auth-specific) | `express-rate-limit` |
| **NoSQL Injection** | Operator ($gt, $ne) stripping | `express-mongo-sanitize` (Express 5 compatible) |
| **HTTP Param Pollution** | Duplicate param removal | `hpp` |
| **Clickjacking** | X-Frame-Options: DENY | `helmet` `frameguard` |
| **MIME Sniffing** | X-Content-Type-Options: nosniff | `helmet` `noSniff` |
| **Man-in-the-Middle** | HSTS (1 year + preload + subdomains) | `helmet` `hsts` |
| **Payload Bomb** | 10kb body size limit | `express.json({ limit: '10kb' })` |
| **Invalid Input** | Schema validation with detailed errors | `zod` + `validateRequest` middleware |
| **Internal Info Leak** | Production-safe error handler (hides 5xx details) | `server.js` global error handler |
| **Server Fingerprinting** | Removes `X-Powered-By: Express` header | `helmet` `hidePoweredBy` |

---

## 📦 Libraries & Use Cases

### Production Dependencies

| Library | Version | Use Case |
|---|---|---|
| **express** | ^5.1.0 | Web framework — routing, middleware, request/response handling |
| **mongoose** | ^8.19.1 | MongoDB ODM — schema definitions, validation, queries |
| **zod** | ^4.1.12 | Runtime schema validation — blocks invalid/malicious input at the route level |
| **jsonwebtoken** | ^9.0.2 | JWT signing & verification — stateless authentication |
| **uuid** | ^13.0.0 | Generates unique `jti` (JWT ID) claims for replay-attack prevention |
| **helmet** | ^8.1.0 | Sets 10+ security HTTP headers in a single middleware call |
| **csrf-csrf** | ^4.0.3 | CSRF protection via the Double Submit Cookie Pattern |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing — restricts which origins can call the API |
| **express-rate-limit** | ^8.1.0 | IP-based rate limiting — blocks flooding, brute-force, and scraping |
| **express-mongo-sanitize** | ^2.2.0 | Strips MongoDB operator characters ($, .) from user input |
| **hpp** | ^0.2.3 | Prevents HTTP Parameter Pollution — removes duplicate query params |
| **cookie-parser** | ^1.4.7 | Parses `Cookie` headers — required by csrf-csrf to read CSRF cookies |
| **dotenv** | ^17.2.3 | Loads `.env` variables into `process.env` |
| **morgan** | ^1.10.1 | HTTP request logger middleware — logs method, path, status, response time |
| **winston** | ^3.19.0 | Structured logging with log levels, transports, and daily file rotation |
| **winston-daily-rotate-file** | ^5.0.0 | Winston transport — auto-rotates log files daily with retention policy |
| **chalk** | ^5.6.2 | Terminal string colorization — used in the custom `logger` utility |
| **bcrypt / bcryptjs** | ^6.0.0 | Password hashing — available for auth routes (not yet wired) |

### Dev Dependencies

| Library | Version | Use Case |
|---|---|---|
| **nodemon** | ^3.1.10 | Auto-restarts server on file changes during development |
| **prettier** | ^3.6.2 | Opinionated code formatter for consistent style |
| **husky** | ^9.1.7 | Git hooks — runs format checks before commits |
| **lint-staged** | ^16.2.4 | Runs formatters only on staged files (fast pre-commit hook) |

---

## 🌍 Environment Variables

Create a `.env` file in the project root. The server will **fail fast** at startup if any required variable is missing.

```env
# ── Server ────────────────────────────────────────────────────
NODE_ENV=development           # development | production
PORT=8080                      # Port the server listens on

# ── MongoDB ───────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=idolize_db
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
MONGO_CONNECT_TIMEOUT_MS=10000
MONGO_SOCKET_TIMEOUT_MS=45000

# ── JWT Authentication ────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_min_32_chars   # REQUIRED
JWT_EXPIRES_IN=1h                                    # e.g. 1h, 7d, 30m

# ── CSRF Protection ───────────────────────────────────────────
CSRF_SECRET=your_csrf_secret_key_min_32_chars        # REQUIRED

# ── CORS ──────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

> ⚠️ **Required variables**: `JWT_SECRET`, `CSRF_SECRET`, `MONGO_URI` — the server will throw and exit if any of these are missing.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v22+
- npm v10+
- MongoDB (local or Atlas URI)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shivankMERNPro/Idolize-Business-Solutions-Assessment.git

# 2. Navigate into the project
cd Idolize-Business-Solutions-Assessment

# 3. Install dependencies
npm install

# 4. Copy the env template and fill in your values
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, and CSRF_SECRET

# 5. Start the development server
npm run dev
```

The server will start at: **`http://localhost:8080`**

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Start server with Nodemon (auto-reload on changes) |
| **build** | `npm run build` | Placeholder command — no compile step is required for native JavaScript |
| **start** | `npm run start` | Run the API from `src/server.js` |
| **format:check** | `npm run format:check` | Check code formatting with Prettier (no changes) |
| **format:fix** | `npm run format:fix` | Auto-fix formatting issues with Prettier |
| **prepare** | `npm run prepare` | Install Husky Git hooks (runs automatically after `npm install`) |

---

## 📡 API Reference with cURL

### Base URL
```
http://localhost:8080
```

### ⚡ Step 0 — Get CSRF Token (Required Before Every Mutation)

All `POST`, `PUT`, and `DELETE` requests require:
1. A **CSRF cookie** (set automatically on first call to `/api/csrf-token`)
2. The `x-csrf-token` **header** with the token value from the response

```bash
# Get CSRF token and save cookie
CSRF=$(curl -c cookies.txt -s http://localhost:8080/api/csrf-token | jq -r '.csrfToken')
echo "CSRF Token: $CSRF"
```

---

### 🩺 Health Check Endpoints

```bash
# GET /api/health — Server health
curl -s http://localhost:8080/api/health | jq .

# GET /api/mongodb/health — MongoDB connection status
curl -s http://localhost:8080/api/mongodb/health | jq .
```

---

### 🎓 Student Endpoints

#### `POST /api/v1/student` — Create a Student

```bash
# ✅ Happy Path
curl -s -b cookies.txt -X POST http://localhost:8080/api/v1/student \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{
    "name": "Shivank Singh",
    "email": "shivank@example.com",
    "age": 22
  }' | jq .

# 🔴 Security: No CSRF token → 403 Forbidden
curl -s -b cookies.txt -X POST http://localhost:8080/api/v1/student \
  -H "Content-Type: application/json" \
  -d '{"name":"Attacker","email":"bad@evil.com","age":20}' | jq .

# 🔴 Security: XSS via HTML in name → 400 Validation Error
curl -s -b cookies.txt -X POST http://localhost:8080/api/v1/student \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":"<script>alert(1)</script>","email":"xss@evil.com","age":20}' | jq .

# 🔴 Security: NoSQL Injection in body → Sanitized/Blocked
curl -s -b cookies.txt -X POST http://localhost:8080/api/v1/student \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":{"$gt":""},"email":"inject@evil.com","age":20}' | jq .

# 🔴 Security: Age out of bounds → 400 Validation Error
curl -s -b cookies.txt -X POST http://localhost:8080/api/v1/student \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":"Test","email":"test@test.com","age":999}' | jq .
```

---

#### `GET /api/v1/students` — Get All Students (Paginated)

```bash
# ✅ Happy Path — Latest students first
curl -s http://localhost:8080/api/v1/students | jq .

# ✅ With pagination
curl -s "http://localhost:8080/api/v1/students?page=1&limit=10" | jq .

# 🔴 Security: HTTP Parameter Pollution — duplicate params sanitized by HPP
curl -s "http://localhost:8080/api/v1/students?page=1&page=99&limit=5&limit=9999" | jq .

# 🔴 Security: Rate Limit Test — triggers 429 after 100 requests/15min
for i in {1..110}; do
  curl -s http://localhost:8080/api/v1/students -o /dev/null -w "Req $i → HTTP %{http_code}\n"
done
```

---

#### `GET /api/v1/student/:id` — Get Student by ID

```bash
# ✅ Happy Path (replace with a real MongoDB ObjectId)
curl -s http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f | jq .

# 🔴 Security: Invalid ObjectId → 400/404
curl -s http://localhost:8080/api/v1/student/INVALID_ID | jq .

# 🔴 Security: NoSQL Injection in path param (URL-encoded {$gt:""})
curl -s "http://localhost:8080/api/v1/student/%7B%24gt%3A%22%22%7D" | jq .
```

---

#### `PUT /api/v1/student/:id` — Update a Student

```bash
# ✅ Happy Path — Partial update (all fields optional)
curl -s -b cookies.txt -X PUT http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":"Shivank Updated","age":23}' | jq .

# 🔴 Security: No CSRF token → 403 Forbidden
curl -s -b cookies.txt -X PUT http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacker"}' | jq .

# 🔴 Security: Forged CSRF token → 403 Forbidden
curl -s -b cookies.txt -X PUT http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: FAKE_FORGED_TOKEN_00000" \
  -d '{"name":"Hacker"}' | jq .

# 🔴 Security: XSS in name field → 400 Validation Error
curl -s -b cookies.txt -X PUT http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":"<img src=x onerror=alert(1)>"}' | jq .

# 🔴 Security: Invalid email format → 400 Validation Error
curl -s -b cookies.txt -X PUT http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"email":"not-a-valid-email"}' | jq .
```

---

#### `DELETE /api/v1/student/:id` — Delete a Student

```bash
# ✅ Happy Path
curl -s -b cookies.txt -X DELETE http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "x-csrf-token: $CSRF" | jq .

# 🔴 Security: No CSRF token → 403 Forbidden
curl -s -b cookies.txt -X DELETE http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f | jq .

# 🔴 Security: No cookie (CSRF cookie absent) → 403 Forbidden
curl -s -X DELETE http://localhost:8080/api/v1/student/60c72b2f9b1d8e1a2c3d4e5f \
  -H "x-csrf-token: $CSRF" | jq .
```

---

### 🔑 JWT Authentication (Built-in, Wire to Routes as Needed)

```bash
# Using the authenticateToken middleware on a protected route:
# Authorization: Bearer <your-jwt-token>

curl -s http://localhost:8080/api/v1/some-protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | jq .

# 🔴 Security: Expired token → 401 Token has expired
# 🔴 Security: Revoked JTI (replay attack) → 401 Token has been revoked
# 🔴 Security: Invalid signature → 401 Invalid token
# 🔴 Security: Missing Authorization header → 401
```

---

### Complete Workflow Script

```bash
#!/bin/bash
BASE="http://localhost:8080"

echo "━━━ 1. Health Check ━━━"
curl -s $BASE/api/health | jq .

echo "━━━ 2. MongoDB Health ━━━"
curl -s $BASE/api/mongodb/health | jq .

echo "━━━ 3. Get CSRF Token ━━━"
CSRF=$(curl -c cookies.txt -s $BASE/api/csrf-token | jq -r '.csrfToken')
echo "CSRF Token: $CSRF"

echo "━━━ 4. Create Student ━━━"
ID=$(curl -s -b cookies.txt -X POST $BASE/api/v1/student \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"name":"Shivank Singh","email":"shivank@test.com","age":22}' | jq -r '._id')
echo "Created ID: $ID"

echo "━━━ 5. Get All Students ━━━"
curl -s "$BASE/api/v1/students?page=1&limit=5" | jq .

echo "━━━ 6. Get Student by ID ━━━"
curl -s "$BASE/api/v1/student/$ID" | jq .

echo "━━━ 7. Update Student ━━━"
CSRF=$(curl -c cookies.txt -s $BASE/api/csrf-token | jq -r '.csrfToken')
curl -s -b cookies.txt -X PUT "$BASE/api/v1/student/$ID" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -d '{"age":23}' | jq .

echo "━━━ 8. Delete Student ━━━"
CSRF=$(curl -c cookies.txt -s $BASE/api/csrf-token | jq -r '.csrfToken')
curl -s -b cookies.txt -X DELETE "$BASE/api/v1/student/$ID" \
  -H "x-csrf-token: $CSRF" | jq .
```

---

## 🗃️ Data Models

### Student Schema

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | String | ✅ | Min 1, Max 100 chars, no HTML tags |
| `email` | String | ✅ | Valid email format, lowercase, unique |
| `age` | Number | ✅ | Integer, 0–150 |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

```js
// Zod Validation Schema
const createStudentSchema = z.object({
  name: noHtml.min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email format"),
  age: z.number().int().min(0).max(150),
});
```

---

## 🔄 Middleware Execution Order

Defined in `server.js` — order is intentional and security-critical:

```
[1] helmetMiddleware          → Security HTTP headers on ALL responses
[2] corsMiddleware            → Origin whitelist enforcement
[3] rateLimiterMiddleware     → 100 req/15min/IP global flood guard
[4] requestLogger             → Morgan HTTP access logging
[5] express.json({ limit })   → Body parsing with 10kb cap
[6] express.urlencoded        → Form data parsing with 10kb cap
[7] mongoSanitizeMiddleware   → Strip NoSQL injection operators from body/params/query
[8] hppMiddleware             → Remove duplicate query parameters
[9] cookieParser()            → Parse cookies (MUST be before CSRF)
[10] csrfProtection           → Validate x-csrf-token against signed cookie
       └── Exempt: GET, HEAD, OPTIONS, /api/csrf-token
```

---

## 🔧 Code Quality Tools

### JavaScript Runtime

The project now runs as native Node.js ESM JavaScript, so there is no compile step before startup. Local imports use `.js` extensions and `package.json` enables ESM with `"type": "module"`.

### Prettier

Auto-formatter configured in `.prettierrc.json`. Run:

```bash
npm run format:check   # Check if code is formatted
npm run format:fix     # Auto-fix all formatting issues
```

### Husky + lint-staged

Pre-commit Git hook automatically runs Prettier on all staged files before every commit — ensuring the codebase stays consistently formatted.

---

## 📝 License

[ISC](LICENSE) © Shivank Singh
