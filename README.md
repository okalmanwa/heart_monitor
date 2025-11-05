# Moyo - Cardiac Health Monitoring Application

**Moyo** ❤️ (Swahili for "Heart") is a comprehensive web application designed for cardiac health monitoring. It enables users to track blood pressure readings, visualize trends with color-coded charts, receive AI-powered insights, and export their data.

## Features

### Phase 1 (MVP) - Current Implementation
- ✅ User authentication (registration and login)
- ✅ Blood pressure reading input (systolic, diastolic, heart rate, notes)
- ✅ Dashboard with readings table
- ✅ Color-coded chart visualization based on AHA guidelines
- ✅ PDF export functionality
- ✅ Print functionality

### Phase 2 (Planned)
- Advanced charting with multiple time periods
- Email notifications for reminders
- Medication tracking
- Health factors tracking (sleep, stress, exercise)

### Phase 3 (Planned)
- AI/ML analysis service for pattern detection
- Anomaly detection
- Trend analysis
- Correlation analysis between BP and health factors

### Phase 4 (Planned)
- Doctor sharing links
- Mobile app (React Native/Flutter)
- Advanced reporting

## Technology Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Context API
- **HTTP Client**: Axios

## Project Structure

```
itaku/
├── backend/              # Django backend
│   ├── itaku_backend/   # Main Django project
│   ├── accounts/        # User authentication app
│   ├── readings/        # Blood pressure readings app
│   ├── health_factors/  # Health factors tracking app
│   ├── insights/        # AI insights app
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript types
│   └── package.json
└── ai-service/          # AI/ML service (Future)
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and secret key.

5. **Set up PostgreSQL database**:
   ```sql
   CREATE DATABASE moyo_db;
   ```

6. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create a superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/token/` - Login (returns JWT tokens)
- `POST /api/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/update/` - Update user profile

### Blood Pressure Readings
- `GET /api/readings/` - List all readings (paginated)
- `POST /api/readings/` - Create a new reading
- `GET /api/readings/{id}/` - Get a specific reading
- `PUT /api/readings/{id}/` - Update a reading
- `DELETE /api/readings/{id}/` - Delete a reading
- `GET /api/readings/export-pdf/` - Export all readings as PDF

### Health Factors
- `GET /api/health-factors/` - List all health factors
- `POST /api/health-factors/` - Create a new health factor entry
- `GET /api/health-factors/{id}/` - Get a specific health factor
- `PUT /api/health-factors/{id}/` - Update a health factor
- `DELETE /api/health-factors/{id}/` - Delete a health factor

### Insights
- `GET /api/insights/` - List all AI-generated insights
- `GET /api/insights/{id}/` - Get a specific insight
- `POST /api/insights/{id}/mark_read/` - Mark an insight as read

## Blood Pressure Categories

Based on AHA (American Heart Association) guidelines:
- **Normal** (Green): Systolic < 120 and Diastolic < 80
- **Elevated** (Orange): Systolic 120-129 and Diastolic < 80
- **High Stage 1** (Red): Systolic 130-139 or Diastolic 80-89
- **High Stage 2** (Dark Red): Systolic ≥ 140 or Diastolic ≥ 90

## Medical Disclaimer

**IMPORTANT**: This application is for informational and monitoring purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## Security Considerations

- All API endpoints require JWT authentication (except registration and login)
- Passwords are hashed using Django's password hashing
- CORS is configured for development
- HTTPS should be enforced in production
- Consider encrypting sensitive health data at rest

## Development Roadmap

- [x] Phase 1: MVP (Authentication, Reading Input, Basic Dashboard, Charts)
- [ ] Phase 2: Notifications, Health Factors, Advanced Charts
- [ ] Phase 3: AI/ML Service Integration
- [ ] Phase 4: Mobile App, Doctor Sharing, Advanced Features

## License

This project is for educational purposes. Please ensure compliance with healthcare data regulations (HIPAA, GDPR, etc.) before deploying to production.

## Contributing

This is a personal project, but contributions and suggestions are welcome!

## Contact

For questions or issues, please open an issue in the repository.

