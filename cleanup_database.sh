#!/bin/bash

# Database cleanup script for Clinic Management System
echo "Cleaning up database..."

# Check if mysql client is available
if command -v mysql &> /dev/null; then
    echo "MySQL client found. Running cleanup script..."
    mysql -h sunbit-mysql -P 30306 -u root -proot my_clinic < cleanup_database.sql
    echo "Database cleanup completed!"
else
    echo "MySQL client not found locally."
    echo "Please run the following command manually in your database:"
    echo ""
    echo "mysql -h sunbit-mysql -P 30306 -u root -proot my_clinic < cleanup_database.sql"
    echo ""
    echo "Or copy and paste the contents of cleanup_database.sql into your MySQL client."
fi

echo ""
echo "After cleanup, you can:"
echo "1. Re-enable Flyway in application.yml (set enabled: true)"
echo "2. Set JPA ddl-auto back to 'none'"
echo "3. Restart the application"
