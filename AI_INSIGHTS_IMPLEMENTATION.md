# AI Insights Implementation

## Overview

AI-powered insights generation has been implemented using OpenAI's GPT-4o-mini model. The system automatically analyzes user health data (blood pressure readings, health factors, medications) and generates actionable insights.

## Features Implemented

### 1. **AI Service Module** (`backend/insights/ai_service.py`)
   - `get_user_health_summary()`: Collects and formats user health data
   - `generate_insights_with_ai()`: Generates AI-powered insights using OpenAI
   - `generate_insight_summary()`: Creates a summary of all insights

### 2. **API Endpoints**
   - `POST /api/insights/generate/` - Manually trigger insight generation
   - `GET /api/insights/summary/` - Get AI-generated summary of insights

### 3. **Automatic Insight Generation**
   - Signal-based: Automatically generates insights when users reach 5, 10, 20, etc. readings
   - Async processing: Uses Celery to avoid blocking requests
   - Rate limiting: Won't generate insights more than once per 24 hours

### 4. **Email Notifications**
   - Automatically sends email notifications when new insights are generated
   - Uses existing notification preferences system

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

This will install `openai==1.3.0`.

### 2. Environment Variables

Make sure your `.env` file contains:

```env
OPENAI_API_KEY=sk-proj-...
```

The API key is already configured in your `.env` file.

### 3. Run Migrations (if needed)

```bash
python manage.py migrate
```

## Usage

### Manual Insight Generation

**For Regular Users:**
```bash
POST /api/insights/generate/
Authorization: Bearer <token>
```

**For Admins (generate for specific user):**
```bash
POST /api/insights/generate/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 123
}
```

**Response:**
```json
{
  "message": "Successfully generated 3 insights",
  "insights_created": 3,
  "insights": [
    {
      "id": 1,
      "insight_text": "Your blood pressure shows an upward trend...",
      "insight_type": "trend",
      "severity": "medium",
      "is_read": false,
      "generated_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### Get Insight Summary

```bash
GET /api/insights/summary/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "summary": "Based on your recent health data, your blood pressure shows...",
  "has_insights": true
}
```

### Automatic Generation

Insights are automatically generated when:
- User reaches 5 readings (first time)
- User reaches 10, 20, 30, etc. readings (every 10 readings)
- At least 24 hours have passed since last generation

## Insight Types

The AI generates four types of insights:

1. **Trend Analysis** - Identifies patterns over time
2. **Anomaly Detection** - Flags unusual readings
3. **Correlation Analysis** - Links health factors to BP
4. **Alert** - Important health warnings

## Severity Levels

- **Low** - Informational insights
- **Medium** - Moderate concerns, lifestyle recommendations
- **High** - Serious concerns, recommend medical consultation

## Data Analyzed

The AI analyzes:
- Last 90 days of blood pressure readings (up to 50 most recent)
- Last 90 days of health factors (sleep, stress, exercise)
- Active medications
- Basic statistics (averages, high reading counts)

## Technical Details

### Model Used
- **GPT-4o-mini** - Cost-effective model suitable for health insights
- Temperature: 0.7 (balanced creativity/accuracy)
- Max tokens: 1000 per generation

### Error Handling
- Graceful fallback if OpenAI API fails
- JSON parsing errors handled
- Rate limiting to prevent excessive API calls

### Performance
- Async processing via Celery
- Non-blocking signal handlers
- Efficient database queries with limits

## Frontend Integration

To display insights in the frontend:

1. Add an "Insights" tab to the Dashboard
2. Fetch insights: `GET /api/insights/`
3. Display insights with severity indicators
4. Add a "Generate Insights" button that calls `POST /api/insights/generate/`

## Testing

To test the implementation:

1. **Create a user with readings:**
   ```bash
   python manage.py shell
   ```
   ```python
   from accounts.models import User
   from readings.models import BloodPressureReading
   from datetime import datetime, timedelta
   
   user = User.objects.first()
   # Create 5+ readings
   for i in range(5):
       BloodPressureReading.objects.create(
           user=user,
           systolic=120 + i*5,
           diastolic=80 + i*3,
           recorded_at=datetime.now() - timedelta(days=i)
       )
   ```

2. **Generate insights:**
   ```python
   from insights.ai_service import generate_insights_with_ai
   insights = generate_insights_with_ai(user)
   print(f"Generated {len(insights)} insights")
   ```

3. **Test API endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/insights/generate/ \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json"
   ```

## Notes

- The OpenAI API key is read from `.env` using `python-decouple`
- Insights are generated asynchronously to avoid blocking user requests
- The system respects user notification preferences
- Medical disclaimers are included in AI prompts

## Future Enhancements

- Add periodic scheduled insight generation (daily/weekly)
- Implement insight caching to reduce API calls
- Add more sophisticated pattern detection
- Include medication effect analysis
- Add seasonal trend detection

