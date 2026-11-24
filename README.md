🚀 Overview
Cognitive EMS is a comprehensive solution for streamlining internal operations, personnel directory management, tracking project allocations, processing complex payroll structures, and handling end-to-end employee lifecycles (joining to offboarding).

Featuring a polished light glassmorphic interface and robust backend integration, it bridges the gap between administrative oversight and employee self-service capabilities.

✨ Key Features
📊 Executive Dashboard & Analytics
Real-time Metrics: Instant visibility into total headcount, active job positions, pending leave approvals, and monthly acquisition velocity.

Interactive Visualizations: Integrated line and donut charts tracking departmental headcount distributions, portfolio health, and hiring trends.

👥 Human Resources & Directory
Personnel Directory: Advanced search, filtering by department, and status toggles for active employees vs. alumni.

Profile Vault: Detailed employee records including role management, location tracking, and document attachments.

Data Portability: One-click Excel/CSV data exports and automated bulk data imports.

🛠️ Project & Resource Allocation Hub
Portfolio Tracking: Manage project deadlines, budgets, client sponsors, and deliverables (Active, Planning, Completed, On Hold).

Team Assignment: Easily assign engineers and personnel to specific projects with dedicated role definitions.

💰 Automated Salary & Payroll Processing
Payroll Execution: Calculate individual or bulk monthly payroll transactions.

Statutory Deductions: Built-in tracking for Provident Fund (PF) and Tax Deducted at Source (TDS).

Automated Payslip Generator: Instant PDF generation and download for formal payroll records using jsPDF.

📝 Lifecycle Management (Onboarding & Offboarding)
Onboarding Hub: Generate professional offer letters with live UI previews and auto-save generated PDFs directly to the candidate's Document Vault.

Offboarding Hub: Streamline exits, generate experience certificates, and automatically transition employee profiles to alumni status.

📋 Attendance & Leave Approvals
Roster Tracking: Daily attendance logging (Present, Absent, Late) with real-time project task updates.

Leave Management: PTO and time-off request review workflow with custom administrator notes and status updates.

🔒 Enterprise Security & Administration
Role-Based Access Control: Secure boundaries between employer/admin controls and employee portals.

Credential Provisioning: Secure employee account creation and activation toggling.

Document Vault: Centralized repository for candidate resumes, ID proofs, contracts, and official letters.

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

There are no built-in passwords. Admin accounts are created on first login from the values you set in `backend/.env`:

| Role | `.env` settings | Access Level |
| :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Full administrative control & analytics |
| **Approval Admin** | `APPROVAL_ADMIN_EMAIL`, `APPROVAL_ADMIN_PASSWORD` | Approvals, leaves, & department oversight |

For a quick look without accounts, set `DEMO_MODE=true` and use the **Live Demo** button on the landing page (demo admin: `admin@cognitiveems.com`). Never enable demo mode on a public server.

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
# Security Settings — REQUIRED: generate your own key
#   python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend origins allowed to call the API (comma-separated)
CORS_ORIGINS=http://localhost:5173

# Passwordless "Live Demo" login. Keep false in production.
DEMO_MODE=false

# Database Configuration (Choose one):
# Option A (Recommended for quick start / local dev): SQLite
DATABASE_URL=sqlite:///./employees.db

# Option B (Production / PostgreSQL):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hash_hrms

# Admin Accounts (leave blank to disable; use strong, unique passwords)
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
APPROVAL_ADMIN_EMAIL=
APPROVAL_ADMIN_PASSWORD=
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

Cognitive EMS — Employee Management System. @2026 All rights reserved.
