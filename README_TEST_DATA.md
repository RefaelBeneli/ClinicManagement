# Test Data Generator for Clinic Management System

This script generates comprehensive test data for the clinic management system, including edge cases and realistic scenarios.

## Features

- **Rich Data Generation**: Creates users, clients, meetings, personal meetings, expenses, and calendar integrations
- **Edge Cases**: Includes special characters, long strings, SQL injection attempts, and boundary conditions
- **Multiple Meetings Per Day**: Generates realistic scenarios with multiple meetings on the same day
- **Different Statuses**: Creates meetings with various statuses (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
- **Multiple Sources**: Uses different meeting sources (Private, Natal, Clalit)
- **Recurring Items**: Generates both recurring and non-recurring meetings and expenses
- **Payment Scenarios**: Creates paid and unpaid meetings with various payment methods

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Make sure your MySQL database is running and accessible
2. Update the database configuration in `generate_test_data.py` if needed:
   ```python
   DB_CONFIG = {
       'host': 'sunbit-mysql',
       'port': 30306,
       'user': 'root',
       'password': 'root',
       'database': 'my_clinic',
       # ... other config
   }
   ```

3. Run the script:
```bash
python generate_test_data.py
```

## Configuration

You can modify the `CONFIG` dictionary in the script to adjust the amount of data generated:

```python
CONFIG = {
    'num_users': 15,                    # Number of users to generate
    'num_clients_per_user': 8,          # Average clients per user
    'num_meetings_per_client': 12,      # Average meetings per client
    'num_personal_meetings_per_user': 6, # Average personal meetings per user
    'num_expenses_per_user': 10,        # Average expenses per user
    'date_range_days': 90,              # Days of data to generate
    'include_edge_cases': True          # Include edge cases in data
}
```

## Edge Cases Included

### Names and Text Fields
- Hebrew and Arabic names
- Names with special characters and accents
- Very long names (254 characters)
- Empty strings and whitespace-only strings
- SQL injection attempts
- Names with quotes and backslashes

### Email Addresses
- Valid email formats
- Invalid email formats (for testing validation)
- Emails with special characters
- Edge case email formats

### Phone Numbers
- Various phone number formats
- International formats
- Numbers with extensions

### Meeting Data
- Multiple meetings per day
- Overlapping time slots
- Meetings with null/empty fields
- Various statuses and payment scenarios

### Database Constraints
- Tests foreign key relationships
- Tests unique constraints
- Tests non-nullable fields
- Tests enum values

## Data Generated

The script generates approximately:
- 15 users with various roles and approval statuses
- 120 clients (8 per user on average)
- 1,440 meetings (12 per client on average)
- 90 personal meetings (6 per user on average)
- 150 expenses (10 per user on average)
- Calendar integrations for ~30% of users

## Testing Scenarios

This data enables testing of:
- **User Management**: Different roles, approval statuses, enabled/disabled users
- **Client Management**: Active/inactive clients, various contact information formats
- **Meeting Scheduling**: Multiple meetings per day, different sources, various statuses
- **Payment Processing**: Paid/unpaid meetings, different payment types
- **Calendar Integration**: Google Calendar event IDs, recurring meetings
- **Expense Tracking**: Various categories, recurring expenses, payment methods
- **Edge Cases**: Special characters, long strings, null values, SQL injection attempts

## Safety

The script is designed to be safe for development environments:
- Uses autocommit to ensure data is saved
- Includes error handling for constraint violations
- Logs all operations for debugging
- Can be run multiple times (will add more data)

## Customization

You can easily modify the script to:
- Add more edge cases
- Generate different types of data
- Adjust the data distribution
- Add new tables or fields
- Change the date ranges
- Modify the probability of edge cases

## Troubleshooting

If you encounter issues:

1. **Connection Errors**: Check your database configuration and ensure MySQL is running
2. **Constraint Violations**: The script handles these gracefully and logs warnings
3. **Memory Issues**: For very large datasets, consider reducing the configuration values
4. **Performance**: The script uses batch operations where possible for efficiency

## Example Output

```
2024-01-15 10:30:00 - INFO - Successfully connected to database
2024-01-15 10:30:01 - INFO - Fetching existing data...
2024-01-15 10:30:01 - INFO - Found 3 meeting sources, 4 payment types, 4 personal meeting types
2024-01-15 10:30:01 - INFO - Generating users...
2024-01-15 10:30:02 - INFO - Generated 15 users
2024-01-15 10:30:02 - INFO - Generating clients...
2024-01-15 10:30:03 - INFO - Generated 120 clients
2024-01-15 10:30:03 - INFO - Generating meetings...
2024-01-15 10:30:05 - INFO - Generated 1440 meetings
2024-01-15 10:30:05 - INFO - Generating personal meetings...
2024-01-15 10:30:06 - INFO - Generated 90 personal meetings
2024-01-15 10:30:06 - INFO - Generating expenses...
2024-01-15 10:30:07 - INFO - Generated 150 expenses
2024-01-15 10:30:07 - INFO - Generating calendar integrations...
2024-01-15 10:30:07 - INFO - Generated 5 calendar integrations
2024-01-15 10:30:07 - INFO - Test data generation completed successfully!
2024-01-15 10:30:07 - INFO - Database connection closed
``` 