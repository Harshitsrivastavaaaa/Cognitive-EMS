# Hash# Employee Management System (HRMS)

A modern, full-stack AI-ready Employee & Human Resource Management platform built with **FastAPI** (Python 3.10+) and **React** (Vite + Tailwind CSS).

---

## ⚡ Quick Start (Run in under 2 minutes)

### 1. Start the Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
# On Windows:
python -m venv .venv
.venv\Scripts\activate
# On macOS / Linux:
# python3 -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template (or copy .env.example)
copy .env.example .env    # On Windows
# cp .env.example .env     # On macOS/Linux

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> 💡 **Backend is live at:** [http://localhost:8000](http://localhost:8000)  
> 📖 **API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Start the Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

> 🌐 **Application is live at:** [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Login Credentials

The system automatically initializes tables and admin credentials on first startup:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@hash.ai` | `superadmin123` | Full administrative control & analytics |
| **Approval Admin** | `admin.approve@hash.ai` | `Hash#Admin2026!SecureKey` | Approvals, leaves, & department oversight |

---

## 📋 Prerequisites

Ensure you have installed:

| Tool | Minimum Version | Download Link |
| :--- | :--- | :--- |
| **Python** | 3.10+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ (LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Bundled with Node.js |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |

---

## 🛠️ Detailed Setup & Configuration

### 1. Clone the Repository

```bash
git clone https://github.com/Harshitsrivastavaaaa/Hash-Employee-Management.git
cd "Hash Employee Management"
```

---

### 2. Backend Configuration (`backend/.env`)

The backend automatically loads settings from `backend/.env`. A ready-to-use template `backend/.env.example` is provided:

```env
# Security Settings
SECRET_KEY=9f0b5402324707bb37517c5b6bb17f8a7095b5e7d5cf2a2559595861ab3decd2
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (Choose one):
# Option A (Recommended for quick start / local dev): SQLite
DATABASE_URL=sqlite:///./employees.db

# Option B (Production / PostgreSQL):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hash_hrms

# Admin Accounts
SUPER_ADMIN_EMAIL=superadmin@hash.ai
SUPER_ADMIN_PASSWORD=superadmin123
APPROVAL_ADMIN_EMAIL=admin.approve@hash.ai
APPROVAL_ADMIN_PASSWORD=Hash#Admin2026!SecureKey
```

#### Database Modes:
- **SQLite (Zero-configuration)**: Set `DATABASE_URL=sqlite:///./employees.db`. The database file `employees.db` is auto-generated in `backend/` with all schemas and seed data on initial launch.
- **PostgreSQL**: Set `DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>`. To migrate existing SQLite data to PostgreSQL, run `python migrate_db.py` inside `backend/`.

---

### 3. Frontend Run Modes

Inside the `frontend/` directory:

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Web Dev (Browser)** | `npm run dev` | Runs Vite dev server with hot reload at `http://localhost:5173` |
| **Desktop App (Electron)** | `npm run electron:dev` | Launches both Vite and the Electron desktop app window |
| **Production Build** | `npm run build` | Compiles production assets into `frontend/dist/` |
| **Preview Build** | `npm run preview` | Serves the production build locally |

---

## 📁 Project Architecture

```
Hash-Employee-Management/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint, lifespan events, CORS, static mounts
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   ├── database.py          # SQLModel engine & session manager
│   │   ├── models.py            # Database tables (User, Employee, Attendance, Project, Leave, etc.)
│   │   ├── auth_utils.py        # Password hashing (bcrypt) & JWT token handlers
│   │   └── routers/
│   │       ├── auth.py          # Login, Registration & verification
│   │       ├── employees.py     # Employee directory & CRUD
│   │       ├── dashboard.py     # Analytics & KPI counters
│   │       ├── attendance.py    # Daily clock-in/out & history
│   │       ├── leave.py         # Leave applications & approval workflows
│   │       ├── salary.py        # Payroll, slips & salary deductions
│   │       ├── projects.py      # Project tracking & assignments
│   │       ├── departments.py   # Department management
│   │       ├── documents.py     # Document & CV upload manager
│   │       ├── employee_portal.py # Self-service employee portal
│   │       └── settings.py      # Company & account settings
│   ├── .env.example             # Environment variable template
│   ├── requirements.txt         # Python dependencies
│   └── employees.db             # Auto-created SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Router & route definitions
│   │   ├── index.css            # Tailwind CSS & global styles
│   │   ├── pages/               # Application views
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EmployeesListPage.jsx
│   │   │   ├── EmployeeProfilePage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── LeaveManagementPage.jsx
│   │   │   ├── PayrollPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ...
│   │   ├── components/          # Reusable UI components & layouts
│   │   ├── context/             # React Context (Auth, Theme, Notifications)
│   │   └── services/            # Axios API client & endpoints
│   ├── vite.config.js           # Vite build configuration
│   └── package.json             # Frontend dependencies & npm scripts
│
└── README.md
```

---

## 🌐 API Overview

All API endpoints are prefixed with `/api/v1`:

| Area | Base Path | Key Capabilities |
| :--- | :--- | :--- |
| 🔐 **Auth** | `/api/v1/auth` | User login, JWT token issue, registration |
| 👥 **Employees** | `/api/v1/employees` | Employee CRUD, search, filter, profile pictures |
| 📊 **Dashboard** | `/api/v1/dashboard` | Workforce metrics, attendance trends, statistics |
| ⏰ **Attendance** | `/api/v1/attendance` | Check-in, check-out, monthly attendance records |
| 🏖️ **Leave** | `/api/v1/leave` | Request time off, review status, approve/reject |
| 💰 **Payroll** | `/api/v1/salary` | Salary slip generation, deductions, pay run |
| 🚀 **Projects** | `/api/v1/projects` | Project tracking, milestone assignments |
| 🏢 **Departments** | `/api/v1/departments` | Department catalog & head allocation |
| 📄 **Documents** | `/api/v1/documents` | Employee CV & document storage |
| 👤 **Portal** | `/api/v1/employee-portal` | Employee self-service workspace |

> Detailed schemas and live tests are accessible via Swagger UI at `/docs`.

---

## 🛠️ Troubleshooting & FAQs

### 1. `ModuleNotFoundError` when starting Backend
- Ensure your virtual environment is active:
  - Windows: `.venv\Scripts\activate`
  - Linux/macOS: `source .venv/bin/activate`
- Run `pip install -r requirements.txt`.

### 2. Port `8000` or `5173` is already in use
- **Backend**: Specify another port: `uvicorn app.main:app --port 8001 --reload`
- **Frontend**: Edit `frontend/vite.config.js` or run `npm run dev -- --port 3000`.

### 3. Database connection errors
- If PostgreSQL is not installed locally, set `DATABASE_URL=sqlite:///./employees.db` in `backend/.env`. SQLite requires zero setup.

### 4. CORS errors during API calls
- Ensure the backend is running on `http://127.0.0.1:8000`. FastAPI has CORS enabled for frontend local origins by default.

---

## 🚢 Deployment Options

- **Linux / VPS (systemd + Nginx + Gunicorn)**: Reference [deploy_instructions.md](backend/deploy_instructions.md) inside `backend/`.
- **Docker / Cloud Containers**: Compatible with any standard Python ASGI and Node.js container images.

---

## 📄 License

Hash# Employee Management System. All rights reserved.
