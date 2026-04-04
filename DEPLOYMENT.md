# 🚀 Lekha Deployment Guide

This guide will help you deploy **Lekha** on Render, Railway, or PythonAnywhere.

---

## 📋 Prerequisites

You need:
- Git account (GitHub)
- Anthropic API key
- Render/Railway account (free)

---

## 1️⃣ Deploy on **Render** (RECOMMENDED)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "deploy: add production configuration"
git push origin main
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**

### Step 3: Connect Repository
- Select your GitHub repo: `Lekha-From_pages_to_deep-comprehension`
- Branch: `main`
- Runtime: **Python 3**

### Step 4: Configure Settings
- **Name**: `lekha` (or your preferred name)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Instance Type**: Free tier ($0/month)

### Step 5: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Your actual API key from [console.anthropic.com](https://console.anthropic.com) |
| `PYTHON_VERSION` | `3.11` |

### Step 6: Deploy
Click **"Create Web Service"**

✅ **Wait 2-3 minutes** → Your app will be live at: `https://lekha-xxxx.onrender.com`

---

## 2️⃣ Deploy on **Railway** (Alternative)

### Step 1: Create Account
Go to [railway.app](https://railway.app), sign up with GitHub

### Step 2: Create New Project
- Click **"Deploy from GitHub"**
- Select your repository
- Grant access

### Step 3: Add Environment Variable
- Open project settings
- Add `ANTHROPIC_API_KEY`

### Step 4: Deploy
Railway auto-detects Python and deploys automatically

✅ Your app URL: `https://your-project.railway.app`

---

## 3️⃣ Deploy on **PythonAnywhere** (Python-Specific)

### Step 1: Create Account
Go to [pythonanywhere.com](https://www.pythonanywhere.com), sign up for free

### Step 2: Upload Code
```bash
# Clone to PythonAnywhere console
git clone https://github.com/YOUR_USERNAME/Lekha-From_pages_to_deep-comprehension.git
cd Lekha-From_pages_to_deep-comprehension
pip install -r requirements.txt
```

### Step 3: Configure Web App
1. Go to **"Web"** tab
2. Click **"Add new web app"** → **"Flask"** → **"Python 3.11"**
3. Set source code path to your cloned directory
4. Update WSGI file with:
```python
from app import app
application = app
```

### Step 4: Set Environment Variables
In **Web** tab → **"Environment variables"**:
```
ANTHROPIC_API_KEY=your_key_here
```

### Step 5: Reload
Click **"Reload"** button

✅ Your app URL: `https://YOUR_USERNAME.pythonanywhere.com`

---

## ⚠️ Important Notes

### File Uploads (Critical)
- Render/Railway use **ephemeral storage** (files deleted on deploy)
- Solution: Use cloud storage (AWS S3, Google Cloud Storage) for production
- For now: Uploads work temporarily but are cleared on restart

### CORS (If using separate frontend)
If you deploy frontend elsewhere, add to `app.py`:
```python
from flask_cors import CORS
CORS(app)
```

### Memory Limits
- **Render Free**: 512MB memory
- **Railway Free**: $5/month minimum
- Suitable for medium traffic

---

## ✅ Testing After Deployment

1. Open your app URL in browser
2. Test upload/reading
3. Verify TTS works
4. Check AI explanations

---

## 🐛 Troubleshooting

### Deployment Failed
- Check build logs (Render → "Logs")
- Verify `ANTHROPIC_API_KEY` is set
- Ensure `requirements.txt` is updated

### API Key Not Working
- Go to [console.anthropic.com](https://console.anthropic.com)
- Verify key is valid
- Check it's in environment variables

### Files Lost After Restart
- Normal on Render/Railway (ephemeral storage)
- Use database or cloud storage for persistence

---

## 💡 Next Steps

1. **Monitor Performance**: Check Render dashboard
2. **Scale if needed**: Upgrade from free tier
3. **Add Database**: For persistent user sessions
4. **Custom Domain**: Add your domain in settings

---

## 🎯 Summary

| Platform | Setup Time | Cost | Best For |
|----------|-----------|------|----------|
| **Render** | 5 min | Free | Easiest, recommended |
| **Railway** | 5 min | $5/mo | Reliable backend |
| **PythonAnywhere** | 10 min | Free | Pure Python projects |

**→ Pick Render for fastest deployment!** 🚀
