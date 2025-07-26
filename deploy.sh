#!/bin/bash

echo "🚀 Building Clinic Management System for AWS Deployment"

# Clean and build the backend
echo "📦 Building backend JAR..."
./gradlew clean build -x test

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
    echo "📁 JAR file location: build/libs/clinic-management-1.0.0.jar"
else
    echo "❌ Backend build failed!"
    exit 1
fi

# Build frontend for production
echo "📦 Building frontend..."
cd frontend
npm run build

# Check if frontend build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Frontend build location: frontend/build/"
    cd ..
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo ""
echo "🎉 Build complete! Ready for AWS deployment."
echo ""
echo "Next steps:"
echo "1. Deploy backend JAR to AWS Elastic Beanstalk"
echo "2. Upload frontend build/ folder to AWS S3"
echo "3. Set up AWS RDS PostgreSQL database"
echo "4. Configure environment variables"
echo ""
echo "Files ready for deployment:"
echo "  - Backend: build/libs/clinic-management-1.0.0.jar"
echo "  - Frontend: frontend/build/" 