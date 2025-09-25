# DEPLOYMENT.md
## Content Distribution System - Deployment Guide

### 🚀 Quick Start

This guide covers deploying your Content Distribution System locally and on major cloud platforms.

---

## 📋 Prerequisites

- **Node.js**: 18.x or higher (22.x recommended)
- **npm**: Latest version
- **Git**: For version control
- **MongoDB Atlas**: Account and cluster
- **Perplexity AI**: API key

---

## 🔧 Environment Variables

Create a `.env` file with these variables:

```env
# AI Service
PERPLEXITY_API_KEY=pplx-your-api-key-here
PERPLEXITY_MODEL=sonar-pro

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/content-distribution?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=production
PORT=3001

# Frontend (if deploying separately)
REACT_APP_API_URL=https://your-backend-domain.com
VITE_API_URL=https://your-backend-domain.com

# Optional: Session Management
SESSION_SECRET=your-session-secret-key
```

---

## 🏠 Local Development

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/content-distribution-system.git
cd content-distribution-system
```

### 2. Install Dependencies
```bash
# For monorepo structure
npm install

# For separate frontend/backend
cd backend && npm install
cd ../frontend && npm install
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env
# Edit .env with your actual values
```

### 4. Start Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev
# or
node server.js

# Frontend (Terminal 2)
cd frontend
npm run dev
# or
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3000 or http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## ☁️ Cloud Deployment Options

### 🟢 Option 1: Vercel (Recommended for Frontend)

#### Frontend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com
```

#### Using Vercel for Full-Stack
```bash
# Deploy entire project as serverless functions
vercel

# Configure vercel.json:
```

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "PERPLEXITY_API_KEY": "@perplexity-api-key",
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

### 🚂 Option 2: Railway (Recommended for Backend)

#### Backend Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Set environment variables
railway variables set PERPLEXITY_API_KEY=your-key
railway variables set MONGODB_URI=your-uri
railway variables set JWT_SECRET=your-secret
```

#### Using Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder (if separate)
4. Set environment variables in dashboard
5. Deploy automatically on push

### 🟣 Option 3: Heroku

#### Backend Deployment
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set PERPLEXITY_API_KEY=your-key
heroku config:set MONGODB_URI=your-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### Heroku Procfile
Create `Procfile` in backend directory:
```
web: node server.js
```

### 🔵 Option 4: Azure App Service

#### Using Azure CLI
```bash
# Install Azure CLI
# Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login and create resources
az login
az group create --name myResourceGroup --location "East US"
az appservice plan create --name myPlan --resource-group myResourceGroup --sku FREE
az webapp create --resource-group myResourceGroup --plan myPlan --name your-app-name

# Set environment variables
az webapp config appsettings set --resource-group myResourceGroup --name your-app-name --settings PERPLEXITY_API_KEY=your-key MONGODB_URI=your-uri

# Deploy
az webapp deployment source config-zip --resource-group myResourceGroup --name your-app-name --src backend.zip
```

### 🟠 Option 5: Google Cloud Platform

#### Using Cloud Run
```bash
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate and set project
gcloud auth login
gcloud config set project your-project-id

# Build and deploy
gcloud builds submit --tag gcr.io/your-project-id/content-distribution
gcloud run deploy --image gcr.io/your-project-id/content-distribution --platform managed

# Set environment variables
gcloud run services update content-distribution --set-env-vars PERPLEXITY_API_KEY=your-key,MONGODB_URI=your-uri
```

#### Dockerfile for Cloud Run
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### 🟡 Option 6: Netlify (Frontend Only)

#### Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy frontend
cd frontend
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

---

## 🏗️ Build Commands by Platform

### Frontend (React/Vite)
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend (Node.js/Express)
```bash
# Development with nodemon
npm run dev

# Production
npm start

# Using PM2 for production
pm2 start server.js --name "content-distribution"
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 free tier)

### 2. Configure Database Access
```bash
# 1. Create database user
# 2. Whitelist IP addresses (0.0.0.0/0 for all or specific IPs)
# 3. Get connection string
```

### 3. Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

---

## 🔐 Security Configuration

### Production Security Checklist
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set secure cookie options
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB Atlas IP whitelisting
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable security headers

### CORS Configuration
```javascript
// In server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

---

## 📊 Monitoring and Logging

### Application Monitoring
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error logging
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Platform-Specific Monitoring
- **Vercel**: Built-in analytics and logs
- **Railway**: Metrics and logs in dashboard
- **Heroku**: Heroku logs and add-ons
- **Azure**: Application Insights
- **GCP**: Cloud Logging and Monitoring

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check if .env file exists and is in correct location
ls -la .env

# Verify variables are set
node -e "console.log(process.env.PERPLEXITY_API_KEY)"
```

#### 2. MongoDB Connection Errors
```bash
# Check connection string format
# Ensure IP is whitelisted
# Verify username/password
```

#### 3. CORS Errors
```bash
# Check frontend URL in CORS configuration
# Verify API URL in frontend environment variables
```

#### 4. API Key Issues
```bash
# Verify Perplexity API key is correct
# Check API quota and limits
```

### Debug Commands
```bash
# Check backend health
curl http://localhost:3001/api/health

# Test specific endpoints
curl -X POST http://localhost:3001/api/content/process \
  -H "Content-Type: application/json" \
  -d '{"content":"test content","tone":"professional"}'

# Check MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));
"
```

---

## 📦 Package.json Scripts

### Backend package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "echo 'No build step required'",
    "health": "curl http://localhost:3001/api/health"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Frontend package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🌐 Custom Domain Setup

### Vercel
```bash
# Add custom domain in Vercel dashboard
# Configure DNS records:
# A record: @ -> 76.76.19.61
# CNAME: www -> vercel-dns.com
```

### Railway
```bash
# Add custom domain in Railway dashboard
# Configure DNS:
# CNAME: @ -> your-app.railway.app
```

### Heroku
```bash
# Add custom domain
heroku domains:add www.yourdomain.com

# Configure DNS:
# CNAME: www -> your-app.herokuapp.com
```

---

## 💰 Cost Estimation

### Development (Free Tier)
- **MongoDB Atlas**: Free (M0 cluster)
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month (Starter plan)
- **Perplexity AI**: $20/month (Pro plan)
- **Total**: $25/month

### Production (Scaled)
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month
- **Perplexity AI**: $20/month
- **Custom Domain**: $10-15/year
- **Total**: $69-74/month

---

## 📚 Additional Resources

### Documentation Links
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Perplexity AI Docs](https://docs.perplexity.ai/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Azure Docs](https://docs.microsoft.com/en-us/azure/)
- [GCP Docs](https://cloud.google.com/docs)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)

### Community Support
- [Discord/Slack communities for each platform]
- [Stack Overflow for technical issues]
- [GitHub Issues for bug reports]

---

## 🎯 Quick Deploy Commands

### Full Stack to Vercel
```bash
vercel --prod
```

### Backend to Railway
```bash
railway up
```

### Backend to Heroku
```bash
git push heroku main
```

### Frontend to Netlify
```bash
npm run build && netlify deploy --prod --dir=dist
```

---

*Last updated: September 25, 2025*
*Version: 1.0.0*

---

## 📝 Notes

- Always test deployment in staging environment first
- Keep environment variables secure and never commit them
- Monitor application performance and logs
- Set up automated backups for production databases
- Implement proper error handling and logging
- Use HTTPS in production
- Keep dependencies updated for security

For questions or issues, please check the troubleshooting section or create an issue in the GitHub repository.
