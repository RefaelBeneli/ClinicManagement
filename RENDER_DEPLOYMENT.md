# 🎨 Render Deployment - COMPLETELY FREE

Deploy your clinic management system 100% FREE on Render!

## 💰 Why Render is Great

- ✅ **Completely FREE** (no credits needed)
- ✅ **750 hours/month** free (enough for 24/7 operation)
- ✅ **Automatic database** included
- ✅ **HTTPS included**
- ✅ **No credit card required**
- ✅ **Auto-deploys** from GitHub

## 🚀 Free Deployment Steps

### **Step 1: Push to GitHub**
```bash
# If not done already
./connect-github.sh
```

### **Step 2: Deploy Backend**

1. **Visit Render**: https://render.com
2. **Sign up with GitHub** (free account)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   ```
   Name: clinic-backend
   Environment: Java
   Build Command: ./gradlew build -x test
   Start Command: java -jar build/libs/clinic-management-1.0.0.jar
   ```

### **Step 3: Create Free Database**

1. **In Render Dashboard**: Click "New +" → "PostgreSQL"
2. **Name**: `clinic-database`
3. **Plan**: Free (100MB storage)
4. **Create Database**

### **Step 4: Configure Environment Variables**

In your backend service, add these environment variables:

```env
DATABASE_URL=postgresql://... (Render provides this from your database)
JWT_SECRET=your_super_secret_jwt_key_32_chars_minimum
SPRING_PROFILES_ACTIVE=prod
```

### **Step 5: Deploy Frontend**

1. **Click "New +" → "Static Site"**
2. **Connect same GitHub repository**
3. **Configure:**
   ```
   Name: clinic-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/build
   ```

4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://clinic-backend.onrender.com/api
   ```

## 🌐 What You Get (100% FREE)

- **Backend**: `https://clinic-backend.onrender.com`
- **Frontend**: `https://clinic-frontend.onrender.com`
- **Database**: PostgreSQL with 100MB storage
- **HTTPS**: Included for both
- **Custom Domains**: Can add your own

## ⚠️ Free Tier Limitations

- **Sleep Mode**: Apps sleep after 15 minutes of inactivity
- **Wake Time**: Takes 30-60 seconds to wake up from sleep
- **For a clinic**: Perfect since not used 24/7

## 🔄 Auto-Deployment

- **Every GitHub push** automatically deploys
- **Separate deployments** for frontend and backend
- **Build logs** available in dashboard

## 💡 Pro Tips

1. **Keep apps awake**: Visit your app every 14 minutes (or upgrade to paid)
2. **Monitor usage**: 750 hours covers full month if always on
3. **Custom domains**: Free SSL certificates included

---

**Setup Time: 15 minutes**
**Monthly Cost: $0 forever** (within limits) 