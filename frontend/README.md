# Moyo Frontend ❤️

React TypeScript frontend for the Moyo cardiac health monitoring application.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Configuration

The frontend is configured to proxy API requests to `http://localhost:8000` (the Django backend). This is configured in `vite.config.ts`.

## Environment Variables

For production, you may want to set:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Features

- User authentication (login/register)
- Blood pressure reading input
- Dashboard with readings table
- Color-coded chart visualization
- PDF export
- Print functionality

