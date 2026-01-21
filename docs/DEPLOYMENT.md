# ReadAI Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended - Easiest)

Railway auto-detects your stack and deploys everything.

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select your ReadAI repo
3. **Create services**:
   - Backend: Railway auto-detects FastAPI
   - Database: Add MongoDB from Railway's marketplace
   - Frontend: Create static site or use Vercel

4. **Set environment variables** in Railway dashboard:
   ```
   MONGO_URL=<railway-mongodb-url>
   DB_NAME=readai
   JWT_SECRET=<generate-secure-key>
   EMERGENT_LLM_KEY=<your-key>
   ```

5. **Deploy** and get your live URL!

---

### 2. Render

1. **Sign up** at [render.com](https://render.com)

2. **Backend (Web Service)**:
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Frontend (Static Site)**:
   - Root Directory: `frontend`
   - Build Command: `yarn install && yarn build`
   - Publish Directory: `build`

4. **Database**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier

---

### 3. Docker (Self-Hosted / VPS)

Deploy anywhere with Docker support (DigitalOcean, AWS, GCP, etc.)

```bash
# Clone your repo
git clone https://github.com/yourusername/readai.git
cd readai

# Create .env file
cat > .env << EOF
JWT_SECRET=your-super-secure-jwt-secret-key
EMERGENT_LLM_KEY=sk-emergent-your-key
EOF

# Deploy with Docker Compose
docker-compose up -d

# Your app is now running at http://localhost
```

---

### 4. Vercel + Railway Combo

Best performance for React frontend.

**Frontend on Vercel:**
1. Import repo to [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env: `REACT_APP_BACKEND_URL=https://your-railway-backend.up.railway.app`

**Backend on Railway:**
1. Create service from `backend` folder
2. Add MongoDB service
3. Configure environment variables

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | Yes |
| `DB_NAME` | Database name (default: readai) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `EMERGENT_LLM_KEY` | API key for Claude AI | Yes |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | Yes |
| `REACT_APP_BACKEND_URL` | Backend API URL for frontend | Yes |

---

## Custom Domain Setup

Most platforms provide free SSL and custom domain support:

1. Add your domain in platform settings
2. Update DNS records (usually CNAME to platform URL)
3. Wait for SSL certificate (automatic)
4. Update `CORS_ORIGINS` to include your domain

---

## Monitoring & Logs

- **Railway**: Built-in logs and metrics dashboard
- **Render**: Log streams in dashboard
- **Docker**: Use `docker-compose logs -f`

---

## Cost Estimates

| Platform | Free Tier | Paid Starting |
|----------|-----------|---------------|
| Railway | $5 credit/month | $5/month |
| Render | 750 hours/month | $7/month |
| Vercel | Generous free tier | $20/month |
| MongoDB Atlas | 512MB free | $9/month |
| DigitalOcean | None | $5/month |

---

## Need Help?

- Check platform documentation
- Open an issue on GitHub
- Review logs for error messages
