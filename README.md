# QR Contact Generator

A modern, full-stack QR code generator for vCard contact sharing with comprehensive analytics. Built with React, Node.js, Express.js, and SQLite.

## Features

- **Professional QR Code Generation**: Create QR codes in multiple formats (PNG, SVG, EPS, PDF)
- **vCard 3.0 Support**: Generate standards-compliant vCard files for instant contact import
- **Real-time Analytics**: Track scans, device types, locations, and engagement metrics
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Direct Download**: QR codes trigger immediate "Add to Contacts" on mobile devices
- **Multi-format Support**: Download QR codes in various formats for different use cases
- **Comprehensive Dashboard**: View detailed analytics and scan statistics
- **Export Capabilities**: Export analytics data as CSV for further analysis

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and graphs
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **qrcode** - QR code generation library
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd qr-contact-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3000
   - Frontend development server on http://localhost:5173

5. **Open your browser**:
   Navigate to http://localhost:5173

## Available Scripts

### Development
```bash
npm run dev          # Start both frontend and backend in development mode
npm run server:dev   # Start only the backend server
npm run client:dev   # Start only the frontend development server
```

### Production
```bash
npm run build        # Build the frontend for production
npm start           # Start the production server
```

### Database
```bash
npm run db:migrate  # Run database migrations
```

### Testing
```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
```

## API Endpoints

### vCard Management
- `POST /api/vcard/generate` - Generate vCard and QR codes
- `GET /api/vcard/:id` - Get vCard by ID
- `GET /api/vcard/:id/download` - Download vCard file
- `PUT /api/vcard/:id` - Update vCard
- `DELETE /api/vcard/:id` - Delete vCard

### QR Code Generation
- `GET /api/qr/:id/:format` - Download QR code in specified format
- `GET /api/qr/:id/:format/data` - Get QR code as data URL
- `POST /api/qr/generate` - Generate QR code from custom data
- `GET /api/qr/:id/scan` - Handle QR code scan (direct vCard download)

### Analytics
- `POST /api/analytics/track/:vcardId` - Track a scan event
- `GET /api/analytics/:vcardId` - Get analytics for specific vCard
- `GET /api/analytics` - Get global analytics
- `GET /api/analytics/export/:vcardId` - Export analytics as CSV

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
qr-contact-generator/
├── server/                 # Backend code
│   ├── database/          # Database initialization and utilities
│   ├── routes/            # API route handlers
│   ├── utils/             # Utility functions (vCard, QR generation)
│   └── index.js           # Main server file
├── src/                   # Frontend code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── dist/                  # Built frontend (production)
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./qr_tracking.db

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# QR Code Configuration
QR_SIZE=10
QR_BORDER=4
QR_ERROR_CORRECTION_LEVEL=M

# Analytics Configuration
ANALYTICS_RETENTION_DAYS=365

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

### vcards Table
- `id` (TEXT PRIMARY KEY) - Unique vCard identifier
- `name` (TEXT NOT NULL) - Contact name
- `company` (TEXT) - Company name
- `title` (TEXT) - Job title
- `email` (TEXT) - Email address
- `phone` (TEXT) - Phone number
- `website` (TEXT) - Website URL
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### scans Table
- `id` (INTEGER PRIMARY KEY) - Scan record ID
- `vcard_id` (TEXT NOT NULL) - Associated vCard ID
- `scan_time` (TIMESTAMP) - When the scan occurred
- `ip_address` (TEXT) - Client IP address
- `user_agent` (TEXT) - Client user agent
- `country` (TEXT) - Client country
- `city` (TEXT) - Client city
- `latitude` (REAL) - Client latitude
- `longitude` (REAL) - Client longitude
- `referer` (TEXT) - HTTP referer
- `device_type` (TEXT) - Device type (mobile/desktop/tablet)
- `action` (TEXT) - Action type (scan/download/etc.)

## Usage

### Generating QR Codes

1. **Fill out the contact form** with your information
2. **Click "Generate Professional QR Code"**
3. **Download your QR codes** in multiple formats
4. **Share the QR code** - when scanned, it will immediately offer to add the contact

### Viewing Analytics

1. **Click "View My Analytics"** on the success page
2. **View detailed statistics** including:
   - Total scans and unique visitors
   - Device type distribution
   - Daily scan trends
   - Recent scan activity
   - Geographic data (if available)

### Global Analytics

1. **Navigate to the Analytics dashboard**
2. **View platform-wide statistics** including:
   - All QR codes and their performance
   - Top performing QR codes
   - Global scan trends
   - Recent activity across all users

## QR Code Formats

- **PNG**: Best for digital use, web, and mobile apps
- **SVG**: Scalable vector format, perfect for web and print
- **EPS**: Professional print format for high-quality printing
- **PDF**: Universal format for sharing and printing

## Mobile Compatibility

The generated QR codes are optimized for mobile devices:
- **iOS**: Automatically triggers "Add to Contacts" when scanned
- **Android**: Prompts to add contact to device
- **Cross-platform**: Works with any QR code scanner

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Sanitizes all user inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## Deployment

### Production Build

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/data/qr_tracking.db
FRONTEND_URL=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Check the documentation above
- Review the API endpoints for integration help

## Changelog

### v1.0.0
- Initial release
- QR code generation in multiple formats
- vCard 3.0 support
- Real-time analytics dashboard
- Mobile-optimized scanning
- Professional UI/UX
- Comprehensive API