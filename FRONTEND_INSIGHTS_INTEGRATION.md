# Frontend Insights Integration

## Overview

AI-powered insights have been fully integrated into the patient dashboard. Patients can now view, generate, and interact with AI-generated health insights directly from the frontend.

## What Was Added

### 1. **New Insights Component** (`frontend/src/components/Insights.tsx`)
   - Displays all user insights in a card-based layout
   - Shows unread count badge
   - Color-coded severity indicators (Low/Medium/High)
   - Insight type chips (Trend/Anomaly/Correlation/Alert)
   - Click to view full insight details in a dialog
   - Auto-marks insights as read when viewed
   - AI summary section at the top

### 2. **Dashboard Integration**
   - Added new "Insights" tab (5th tab) to the Dashboard
   - Positioned between "Charts" and "Notifications"
   - Fully integrated with existing dashboard structure

## Features

### Generate Insights
- **"Generate Insights" button** at the top of the Insights tab
- Uses OpenAI to analyze user's health data
- Shows loading state during generation
- Displays success/error messages
- Automatically refreshes insights list after generation

### View Insights
- **Card-based layout** with hover effects
- **Visual indicators:**
  - Severity badges (Low/Medium/High) with color coding
  - Type chips (Trend/Anomaly/Correlation/Alert)
  - "NEW" badge for unread insights
  - Border highlight for unread insights
- **Click any insight** to view full details in a dialog
- **Auto-mark as read** when viewing

### AI Summary
- Displays an AI-generated summary of all insights
- Shown at the top of the insights list
- Automatically fetched when the component loads

### Empty State
- Helpful message when no insights exist
- Guidance on requirements (need at least 3 readings)
- Quick action button to generate insights

## UI/UX Features

1. **Visual Hierarchy:**
   - Unread insights have a colored border
   - Severity icons (Error/Warning/Info)
   - Color-coded chips for quick scanning

2. **Interactivity:**
   - Hover effects on insight cards
   - Smooth transitions
   - Loading states for async operations

3. **Feedback:**
   - Success/error alerts
   - Loading indicators
   - Unread count badge in header

4. **Accessibility:**
   - Clear visual indicators
   - Readable typography
   - Proper contrast ratios

## API Integration

The component uses the following endpoints:

- `GET /api/insights/` - Fetch all insights
- `POST /api/insights/generate/` - Generate new insights
- `GET /api/insights/summary/` - Get AI summary
- `POST /api/insights/{id}/mark_read/` - Mark insight as read

## Usage

1. **Navigate to Dashboard**
2. **Click the "Insights" tab** (5th tab)
3. **View existing insights** or click "Generate Insights" to create new ones
4. **Click any insight card** to view full details
5. **Check the AI Summary** at the top for an overview

## Requirements

- User must have at least 3 blood pressure readings to generate insights
- OpenAI API key must be configured in backend `.env`
- Backend must be running with Celery worker (for async generation)

## Automatic Generation

Insights are also automatically generated when:
- User reaches 5 readings (first time)
- User reaches 10, 20, 30, etc. readings (every 10 readings)
- At least 24 hours have passed since last generation

## Future Enhancements

Potential improvements:
- Filter insights by type or severity
- Sort by date, severity, or type
- Export insights as PDF
- Share insights with healthcare providers
- Insight history/archive
- Push notifications for new insights

