# 24/7 Permanent Cloud Deployment Guide for SentriX

This guide allows you to host SentriX permanently on the internet for **FREE**, so anyone (evaluators, hackathon judges, teachers, visitors) can access your live dashboard **24 hours a day, 7 days a week, without your laptop running**.

---

## ⚡ Method 1: Render.com (Recommended - 100% Free)

### Step 1: Create a GitHub Repository (Takes 1 minute)
1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. Repository name: `sentrix`
3. Visibility: Choose **Public** (or Private)
4. Do **NOT** check "Initialize with README" (we already have all files ready)
5. Click **"Create repository"**

### Step 2: Push Your Local Code to GitHub
In your Windows Command Prompt or PowerShell, run:
```bash
cd c:\Users\mohan\Downloads\SentriX
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/sentrix.git
git push -u origin main
```
*(Replace `<YOUR_GITHUB_USERNAME>` with your real GitHub username).*

---

### Step 3: Deploy on Render in 2 Clicks
1. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account.
2. Click the blue **"New +"** button at the top right and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and click **Next**.
4. Select your **`sentrix`** repository from the list.
5. In the settings page:
   - **Name**: `sentrix-campus` (or any name you like)
   - **Region**: Choose any (e.g. *Singapore* or *Oregon*)
   - **Environment / Runtime**: Select **Docker**
   - **Instance Type**: Select **Free ($0/month)**
6. Click **"Deploy Web Service"** at the bottom!

---

### 🎉 Your Permanent Link is Live!
Render will build the Docker container and give you a permanent HTTPS URL like:
**`https://sentrix-campus.onrender.com`**

- ✅ **Works 24/7/365**
- ✅ **Your laptop can be completely shut down and closed**
- ✅ **Real-time autonomous telemetry & scenarios run uninterrupted in the cloud**
- ✅ **Pre-loaded with all 25 Safe-Nodes and realistic campus simulations**

---

## ⚡ Method 2: Railway.app (Alternative 1-Click)

1. Go to **[https://railway.app](https://railway.app)** and log in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select `sentrix`.
4. Click **"Add Domain"** in settings.
5. Railway provides your instant live URL:
   `https://sentrix.up.railway.app`
