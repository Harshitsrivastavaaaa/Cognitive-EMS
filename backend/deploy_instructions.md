# 🚀 Cognitive EMS - FastAPI + Uvicorn Deployment Guide

This guide details how to deploy the **Python FastAPI + Uvicorn** backend on **Hostinger VPS** (or any Ubuntu/Debian Linux VPS server).

---

## 🛠️ Step 1: VPS Server Setup

Connect to your Hostinger VPS via SSH:
```bash
ssh root@<YOUR_VPS_IP>
```

Update system packages and install Python 3 & Nginx:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git -y
```

---

## 📂 Step 2: Clone & Configure Backend

1. Navigate to web root and clone your repository:
   ```bash
   cd /var/www
   git clone https://github.com/your-username/akiyam-hrms.git
   cd akiyam-hrms/backend
   ```

2. Create virtual environment & install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/venv/activate
   pip install -r requirements.txt
   ```

---

## ⚙️ Step 3: Configure Systemd Service (Automated Daemon)

Copy the provided service template file:
```bash
sudo cp akiyam-backend.service /etc/systemd/system/akiyam-backend.service
sudo systemctl daemon-reload
sudo systemctl start akiyam-backend
sudo systemctl enable akiyam-backend
```

Check backend status:
```bash
sudo systemctl status akiyam-backend
```

---

## 🌐 Step 4: Configure Nginx Reverse Proxy

Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/akiyam-hrms
```

Paste the following Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site & restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/akiyam-hrms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 5: Enable Free SSL (HTTPS with Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

Your **Python FastAPI + Uvicorn** backend is now live with HTTPS on Hostinger VPS!
