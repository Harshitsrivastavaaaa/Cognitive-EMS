# Hash# Employee Management System

A full-stack employee management platform built with **FastAPI** (Python) and **React** (Vite). Features include employee CRUD, attendance tracking, a dashboard with analytics, user authentication (JWT), and user settings.

---

## Prerequisites

Make sure you have the following installed before proceeding:

| Tool       | Version  | Download                                      |
| ---------- | -------- | --------------------------------------------- |
| **Python** | 3.10+    | [python.org](https://www.python.org/downloads/) |
| **Node.js**| 18+      | [nodejs.org](https://nodejs.org/)               |
| **npm**    | 9+       | Bundled with Node.js                            |
| **Git**    | Any      | [git-scm.com](https://git-scm.com/)            |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://gitlab.akiyam.in/harshit/akiyam-employee-management.git
cd akiyam-employee-management
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
```

#### a) Create a Python virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

#### b) Install dependencies

```bash
pip install -r requirements.txt
```

#### c) Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hash_hrms
```

> **Note on Database Options:**
> - **PostgreSQL** *(Recommended for Production)*: Set `DATABASE_URL=postgresql://user:password@localhost:5432/hash_hrms`.
> - **SQLite Fallback**: Set `DATABASE_URL=sqlite:///./employees.db`.
> - **Migrating from SQLite to PostgreSQL**: Run `python migrate_db.py` from the `backend` directory.

> **Tip:** Generate a secure `SECRET_KEY` by running:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```



#### d) Run the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**.

- Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

> **Note:** On first startup, the database (`employees.db`) and tables are created automatically, and sample seed data is inserted.

---

### 3. Frontend Setup (React + Vite + Electron)

Open a **new terminal** and navigate to the `frontend/` directory:

```bash
cd frontend
```

#### a) Install dependencies

```bash
npm install
```

#### b) Run the Frontend Server / Application

Choose one of the following run commands depending on your target environment:

##### 🌐 Option A: Web Browser Development Mode (Recommended for Web Dev)
Runs the Vite development server with hot-module replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to **http://localhost:5173**.

##### 💻 Option B: Desktop App (Electron) Development Mode
Runs Vite dev server and launches the desktop Electron application window simultaneously:
```bash
npm run electron:dev
```

##### 🔍 Option C: Preview Production Web Build
Builds production static assets into `dist/` and runs a local server to preview the build:
```bash
npm run build
npm run preview
```

---

### 4. Run Both Together (Quick Reference)

| Target | Terminal 1 (Backend) | Terminal 2 (Frontend) | Access Location |
| ------ | -------------------- | --------------------- | --------------- |
| **Web Browser** | `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000` | `cd frontend && npm run dev` | **http://localhost:5173** |
| **Desktop App** | `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000` | `cd frontend && npm run electron:dev` | **Desktop Window (Electron)** |

> **Note for macOS / Linux:** Activate the Python environment using `source .venv/bin/activate` instead of `.venv\Scripts\activate`.

---

## Project Structure

```
akiyam-employee-management/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint & seed data
│   │   ├── config.py            # Pydantic settings (reads .env)
│   │   ├── database.py          # SQLModel engine & session
│   │   ├── models.py            # DB models (User, Employee, Attendance, etc.)
│   │   ├── auth_utils.py        # JWT & password utilities
│   │   ├── routers/
│   │   │   ├── auth.py          # Login / Register endpoints
│   │   │   ├── employees.py     # Employee CRUD + CV upload
│   │   │   ├── dashboard.py     # Dashboard analytics
│   │   │   ├── attendance.py    # Attendance management
│   │   │   └── settings.py      # User settings
│   │   └── uploads/             # Uploaded files (CVs, etc.)
│   ├── .env                     # Environment variables (not committed)
│   ├── requirements.txt         # Python dependencies
│   └── employees.db             # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component & routing
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Global styles
│   │   ├── pages/               # Page-level components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EmployeesListPage.jsx
│   │   │   ├── EmployeeProfilePage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── ...
│   │   ├── components/          # Reusable UI components
│   │   │   ├── charts/
│   │   │   ├── common/
│   │   │   ├── employees/
│   │   │   └── layout/
│   │   ├── services/            # API client & auth helpers
│   │   ├── context/             # React context providers
│   │   └── hooks/               # Custom React hooks
│   ├── vite.config.js           # Vite configuration
│   ├── package.json             # Node dependencies & scripts
│   └── index.html               # HTML entry point
│
└── README.md
```

---

## API Endpoints

All API routes are prefixed with `/api/v1`.

| Method   | Endpoint                        | Description               |
| -------- | ------------------------------- | ------------------------- |
| `POST`   | `/api/v1/auth/register`        | Register a new user       |
| `POST`   | `/api/v1/auth/login`           | Login & get JWT token     |
| `GET`    | `/api/v1/employees`            | List all employees        |
| `POST`   | `/api/v1/employees`            | Create a new employee     |
| `GET`    | `/api/v1/employees/{id}`       | Get employee by ID        |
| `PUT`    | `/api/v1/employees/{id}`       | Update employee           |
| `DELETE` | `/api/v1/employees/{id}`       | Delete employee           |
| `GET`    | `/api/v1/dashboard/stats`      | Dashboard statistics      |
| `GET`    | `/api/v1/attendance`           | Get attendance records    |
| `POST`   | `/api/v1/attendance`           | Mark attendance           |
| `GET`    | `/api/v1/settings`             | Get user settings         |
| `PUT`    | `/api/v1/settings`             | Update user settings      |

> For the full interactive API docs, visit `/docs` on the running backend.

---

## Tech Stack

### Backend
- **FastAPI** — High-performance async Python web framework
- **SQLModel** — SQL database ORM (SQLAlchemy + Pydantic)
- **PostgreSQL** — Robust relational database (with SQLite fallback for local desktop)
- **psycopg2-binary** — PostgreSQL database driver
- **Uvicorn** — ASGI server
- **python-jose** — JWT token handling
- **Passlib + bcrypt** — Password hashing

### Frontend
- **React 18** — UI library
- **Vite 5** — Build tool & dev server
- **Tailwind CSS 4** — Utility-first CSS framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **Recharts** — Charts & data visualization
- **Framer Motion** — Animations
- **Lucide React** — Icon library
- **React Hook Form + Zod** — Form handling & validation
- **Electron** *(optional)* — Desktop app packaging

## 🚀 Hostinger VPS Deployment

For complete end-to-end instructions on deploying both backend (FastAPI) and frontend (React static build) on **Hostinger VPS** using Nginx, Gunicorn, systemd, and Let's Encrypt SSL, see:

📖 **[HOSTINGER_DEPLOYMENT.md](file:///c:/Users/ssriv/Akiyam%20Employ%20Management/akiyam-employee-management/HOSTINGER_DEPLOYMENT.md)**

---

## Building for Production

### Backend
The backend runs as-is in production with any ASGI server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
Build the static assets:

```bash
cd frontend
npm run build
```

The output will be in `frontend/dist/`.

### Electron Desktop App *(optional)*

```bash
cd frontend
npm run electron:build
```

---

## Default Seed Data

On first run, the backend auto-creates these sample employees:

| Name               | Role              | Department  |
| ------------------ | ----------------- | ----------- |
| Harshit Srivastava | Senior Architect  | Engineering |
| Sarah Jenkins      | Product Designer  | Design      |
| Alex Rivera        | Backend Engineer  | Engineering |

---

## Troubleshooting

| Issue                            | Solution                                                                 |
| -------------------------------- | ------------------------------------------------------------------------ |
| `ModuleNotFoundError`            | Make sure the virtual environment is activated (`source .venv/bin/activate` or `.venv\Scripts\activate`) |
| Port already in use              | Change the port: `--port 8001` (backend) or edit `vite.config.js` (frontend) |
| CORS errors in browser           | The backend allows all origins by default — verify the backend is running |
| Database locked                  | Ensure only one backend instance is running at a time (SQLite limitation) |
| `npm install` fails              | Delete `node_modules/` and `package-lock.json`, then run `npm install` again |

---

## License

Internal project — Hash#.

---

## Authors

- **Harshit Srivastava** — Creator & Lead Developer
