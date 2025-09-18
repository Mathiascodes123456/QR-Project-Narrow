# QR → vCard Generator

A minimal, production-ready FastAPI application that generates QR codes that instantly download vCard files when scanned. No landing pages, no intermediate steps - just direct contact downloads.

## Features

- **Single HTML form** for contact information (name, company, title, email, phone, website)
- **vCard 3.0 generation** with proper formatting
- **Multiple QR code formats**: PNG, SVG, EPS, PDF (for print)
- **Two QR modes**:
  - **URL Mode**: QR contains a download link (recommended)
  - **Direct Mode**: QR contains vCard data directly
- **Instant downloads** with correct headers for mobile "Add to Contacts"
- **Clean, minimal UI** with Tailwind CSS
- **Comprehensive test suite** with pytest

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd qr-vcard-generator
   ```

2. **Install dependencies**:
   ```bash
   make install
   # or
   pip install -r requirements.txt
   ```

3. **Run development server**:
   ```bash
   make dev
   # or
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Open browser**: http://localhost:8000

### Production Deployment

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Or with gunicorn (recommended for production)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Home page with contact form |
| `POST` | `/generate` | Generate vCard and QR codes |
| `GET` | `/scan/{id}` | **Direct vCard download** (no landing page) |
| `GET` | `/qr/{id}.{format}` | Download QR code (png/svg/eps/pdf) |
| `GET` | `/vcard/{id}` | Direct vCard download |

## Development

### Available Commands

```bash
make dev        # Start development server
make test       # Run tests
make test-cov   # Run tests with coverage
make lint       # Lint code
make format     # Format code
make clean      # Clean cache files
make check      # Run lint and tests
```

### Project Structure

```
qr-vcard-generator/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── vcard.py         # vCard generation
│   ├── qr.py           # QR code generation
│   └── templates/
│       ├── form.html    # Contact form
│       └── success.html # Success page
├── tests/
│   ├── __init__.py
│   ├── test_main.py     # API tests
│   ├── test_vcard.py    # vCard tests
│   └── test_qr.py       # QR code tests
├── static/              # Static files (if needed)
├── requirements.txt     # Dependencies
├── Makefile            # Development commands
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## QA Checklist

Before deploying to production, verify the following:

### ✅ Mobile Testing
- [ ] **iOS Safari**: Scan QR code → "Add to Contacts" appears
- [ ] **Android Chrome**: Scan QR code → "Add to Contacts" appears
- [ ] **iOS Camera**: Scan QR code → Contact import works
- [ ] **Android Camera**: Scan QR code → Contact import works

### ✅ File Downloads
- [ ] **vCard download**: Correct `text/vcard` content-type
- [ ] **vCard filename**: Proper slugified name (e.g., `john-doe.vcf`)
- [ ] **QR PNG**: Downloads and displays correctly
- [ ] **QR SVG**: Downloads and displays correctly
- [ ] **QR EPS**: Downloads (for print)
- [ ] **QR PDF**: Downloads (for print)

### ✅ No Landing Pages
- [ ] **Direct scan**: `/scan/{id}` returns vCard immediately
- [ ] **No HTML**: Scan endpoint returns raw vCard, not HTML
- [ ] **Correct headers**: `Content-Disposition: attachment`

### ✅ QR Code Modes
- [ ] **URL Mode**: QR contains download link
- [ ] **Direct Mode**: QR contains vCard text directly
- [ ] **Both modes**: Work on mobile devices

### ✅ Form Validation
- [ ] **Required fields**: Name is required
- [ ] **Email format**: Validates email format
- [ ] **Phone cleaning**: Removes formatting characters
- [ ] **Website protocol**: Adds https:// if missing

### ✅ Error Handling
- [ ] **Invalid QR ID**: Returns 404
- [ ] **Invalid format**: Returns 404 for unsupported formats
- [ ] **Empty form**: Shows validation errors

## Testing

### Run All Tests
```bash
make test
```

### Run with Coverage
```bash
make test-cov
```

### Test Specific Module
```bash
pytest tests/test_vcard.py -v
pytest tests/test_qr.py -v
pytest tests/test_main.py -v
```

## Environment Variables

Create a `.env` file for configuration:

```bash
# Optional: Custom base URL for QR codes
BASE_URL=http://localhost:8000

# Optional: QR code settings
QR_SIZE=10
QR_BORDER=4
```

## v2 Features (Future)

The following features are planned for v2 and should be implemented in the `work/v2` branch:

- [ ] SQLite database for scan tracking
- [ ] Simple authentication for dashboard
- [ ] Scan analytics and statistics
- [ ] ngrok integration for remote testing
- [ ] Bulk QR code generation
- [ ] Custom QR code styling

## Troubleshooting

### Common Issues

1. **QR code not scanning**: Ensure the QR code is large enough and has good contrast
2. **vCard not importing**: Check that all required fields are filled
3. **Download not working**: Verify correct content-type headers
4. **Mobile not offering "Add to Contacts"**: Ensure vCard format is valid

### Debug Mode

Enable debug logging:
```bash
export PYTHONPATH=.
uvicorn app.main:app --reload --log-level debug
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

For issues and questions:
- Create an issue in the repository
- Check the QA checklist above
- Review the test suite for examples
