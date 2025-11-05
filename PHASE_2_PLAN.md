# Phase 2 Implementation Plan ❤️

## Overview
Phase 2 adds advanced features to Moyo for better health tracking and user engagement.

## Features to Implement

### 1. Health Factors Tracking ✅ (Backend Ready)
- [x] Backend models and API endpoints
- [ ] Frontend UI for tracking:
  - Sleep quality (1-5 scale)
  - Stress level (1-5 scale)
  - Exercise duration (minutes)
  - Notes
- [ ] Integration with dashboard

### 2. Advanced Charting
- [ ] Time period filters (Last 7 days, 30 days, 3 months, 1 year, All time)
- [ ] Combined charts showing BP + Health Factors correlation
- [ ] Trend lines and averages
- [ ] Export chart as image

### 3. Medication Tracking
- [ ] Backend model for medications
- [ ] API endpoints (CRUD)
- [ ] Frontend UI:
  - Add/edit medications
  - Medication list
  - Link medications to readings
  - Reminders for medication

### 4. Email Notifications
- [ ] Backend email service (SendGrid/Amazon SES)
- [ ] Email templates
- [ ] Reminder system:
  - Daily reading reminders
  - Weekly summary emails
  - Medication reminders
- [ ] User preferences for notifications

## Implementation Order

### Step 1: Health Factors Frontend UI
1. Create HealthFactorsForm component
2. Create HealthFactorsTable component
3. Add to Dashboard
4. Create HealthFactorsChart component

### Step 2: Advanced Charting
1. Add time period selector to BPChart
2. Filter readings by date range
3. Add trend lines and statistics
4. Add chart export functionality

### Step 3: Medication Tracking
1. Create Medication model in backend
2. Create API endpoints
3. Create MedicationForm component
4. Create MedicationList component
5. Add medication field to Reading model (optional link)

### Step 4: Email Notifications
1. Set up email service (SendGrid)
2. Create email templates
3. Create Celery tasks for scheduled emails
4. Add notification preferences to User model
5. Create notification settings UI

## Technical Requirements

### Backend
- Email service integration (SendGrid recommended)
- Celery for background tasks
- Redis for Celery broker (already in requirements)

### Frontend
- Date picker component (MUI DatePicker)
- Chart enhancements (Chart.js plugins)
- Toast notifications (react-toastify or MUI Snackbar)

## Dependencies to Add

### Backend
```python
# Already have:
celery==5.3.4
redis==5.0.1

# Need to add:
sendgrid==6.11.0  # or django-ses for AWS
celery-beat==2.5.0  # for scheduled tasks
```

### Frontend
```json
{
  "@mui/x-date-pickers": "^6.0.0",
  "react-toastify": "^9.0.0",
  "date-fns": "^2.30.0"  // already have
}
```

## Timeline Estimate
- Health Factors UI: 2-3 hours
- Advanced Charting: 2-3 hours
- Medication Tracking: 3-4 hours
- Email Notifications: 4-5 hours

**Total: ~12-15 hours**

Let's start with Health Factors UI! 🚀

