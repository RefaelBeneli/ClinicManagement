# 🚀 AWS Free Tier Deployment Guide

Deploy your Clinic Management System to AWS using free tier services!

## 📋 Prerequisites

1. **AWS Account** (Free Tier eligible)
2. **AWS CLI** installed on your computer
3. **Your application** built and ready

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   S3 Bucket      │    │ Elastic         │
│   (Frontend)    │    │   (React App)    │    │ Beanstalk       │
└─────────────────┘    └──────────────────┘    │ (Spring Boot)   │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   RDS           │
                                               │   (PostgreSQL)  │
                                               └─────────────────┘
```

## 🎯 Step-by-Step Deployment

### **Step 1: Build Your Application**

```bash
# Run the build script
./deploy.sh
```

This creates:
- `build/libs/clinic-management-1.0.0.jar` (Backend)
- `frontend/build/` (Frontend files)

---

### **Step 2: Create AWS RDS Database (FREE)**

1. **Go to AWS RDS Console**
   - Visit: https://console.aws.amazon.com/rds/

2. **Create Database**
   - Click "Create database"
   - Choose **PostgreSQL**
   - Template: **Free tier**
   - DB instance identifier: `clinic-db`
   - Master username: `clinic_user`
   - Master password: `your_secure_password`
   - Storage: 20 GB (Free tier limit)

3. **Configure Security Group**
   - Allow inbound connections on port 5432
   - Add your Elastic Beanstalk security group

4. **Note Connection Details**
   ```
   Endpoint: clinic-db.xxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   Database: postgres
   ```

---

### **Step 3: Deploy Backend to Elastic Beanstalk (FREE)**

1. **Go to Elastic Beanstalk Console**
   - Visit: https://console.aws.amazon.com/elasticbeanstalk/

2. **Create New Application**
   - Application name: `clinic-management`
   - Platform: **Java**
   - Platform version: **Java 17**
   - Upload your JAR: `build/libs/clinic-management-1.0.0.jar`

3. **Configure Environment Variables**
   ```
   DATABASE_URL=jdbc:postgresql://YOUR_RDS_ENDPOINT:5432/postgres
   DATABASE_USERNAME=clinic_user
   DATABASE_PASSWORD=your_secure_password
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
   FRONTEND_URL=https://your-cloudfront-domain.com
   SPRING_PROFILES_ACTIVE=prod
   ```

4. **Deploy Application**
   - Click "Create application"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `http://clinic-management.elasticbeanstalk.com`

---

### **Step 4: Deploy Frontend to S3 + CloudFront (FREE/CHEAP)**

#### **4.1: Create S3 Bucket**

1. **Go to S3 Console**
   - Visit: https://console.aws.amazon.com/s3/

2. **Create Bucket**
   - Bucket name: `clinic-management-frontend-[random-string]`
   - Region: `us-east-1`
   - Uncheck "Block all public access"
   - Enable static website hosting

3. **Upload Frontend Files**
   ```bash
   aws s3 sync frontend/build/ s3://your-bucket-name/
   ```

4. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

#### **4.2: Set Up CloudFront (Optional but Recommended)**

1. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect 404 to `/index.html` (for React Router)

2. **Update Backend CORS**
   - Add your CloudFront domain to `FRONTEND_URL` environment variable

---

### **Step 5: Update Frontend Configuration**

1. **Update API URL** (Already done)
   - Frontend now uses `REACT_APP_API_URL` environment variable

2. **Create Production Build with API URL**
   ```bash
   cd frontend
   REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api npm run build
   ```

3. **Re-upload to S3**
   ```bash
   aws s3 sync build/ s3://your-bucket-name/ --delete
   ```

---

## 💰 AWS Free Tier Limits & Costs

### **Free Services:**
- ✅ **Elastic Beanstalk**: Free tier includes 750 hours/month
- ✅ **RDS PostgreSQL**: 750 hours/month + 20GB storage
- ✅ **S3**: 5GB storage + 20,000 GET requests
- ✅ **CloudFront**: 1TB data transfer + 10,000,000 requests

### **Expected Monthly Costs:**
- **$0-5/month** if staying within free tier limits
- **$10-20/month** after free tier expires

---

## 🔧 Environment Variables Reference

### **Backend (Elastic Beanstalk)**
```env
DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/postgres
DATABASE_USERNAME=clinic_user
DATABASE_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
FRONTEND_URL=https://your-cloudfront-domain.com
SPRING_PROFILES_ACTIVE=prod
PORT=5000
```

### **Frontend (Build time)**
```env
REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api
```

---

## 🚀 Quick Deployment Script

Create this script for easy redeployment:

```bash
#!/bin/bash
# quick-deploy.sh

echo "🔄 Redeploying Clinic Management System..."

# Build backend
./gradlew clean build -x test

# Build frontend with production API URL
cd frontend
REACT_APP_API_URL="https://your-backend-url.elasticbeanstalk.com/api" npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name/ --delete

# Deploy backend to Elastic Beanstalk
cd ..
eb deploy

echo "✅ Deployment complete!"
```

---

## 🔍 Troubleshooting

### **Common Issues:**

1. **CORS Errors**
   - Check `FRONTEND_URL` environment variable in Elastic Beanstalk
   - Ensure CloudFront/S3 URL is correct

2. **Database Connection Issues**
   - Verify RDS security group allows EB connections
   - Check database credentials and endpoint

3. **Build Failures**
   - Ensure Java 17 is selected in Elastic Beanstalk
   - Check application logs in EB console

4. **Frontend Not Loading**
   - Verify S3 bucket policy allows public access
   - Check CloudFront error page configuration

---

## 📱 Testing Your Deployment

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.elasticbeanstalk.com/actuator/health
   ```

2. **Frontend Access**
   - Visit your CloudFront domain
   - Test user registration and login

3. **Full System Test**
   - Register new account
   - Add a client
   - Test all features

---

## 🎉 You're Live!

Your Clinic Management System is now running on AWS! 

**URLs:**
- 🌐 **Frontend**: https://your-cloudfront-domain.com
- 🔗 **Backend**: https://your-backend-url.elasticbeanstalk.com
- 🗄️ **Database**: Managed by AWS RDS

**Next Steps:**
- Set up monitoring with CloudWatch
- Configure backups for RDS
- Set up a custom domain name
- Add SSL certificate via AWS Certificate Manager

---

## 📞 Support

For issues with this deployment:
1. Check AWS CloudWatch logs
2. Review Elastic Beanstalk environment health
3. Verify environment variables are set correctly

**Happy Deploying! 🚀** 