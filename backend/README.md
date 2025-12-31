# Contextual FAQ Generator - Backend

Backend API for the Contextual FAQ Generator application built with Node.js, Express.js, and MongoDB.

## Features

- Web crawling using Cheerio
- AI-powered FAQ generation using Claude API
- MongoDB database with Mongoose ODM
- RESTful API endpoints
- Error handling middleware
- CORS enabled

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Claude API key from Anthropic

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` and add your:
   - MongoDB connection string
   - Claude API key

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health check
- `GET /api/health` - API health check

### Crawl
- `POST /api/crawl` - Crawl a website
  ```json
  {
    "url": "https://example.com"
  }
  ```

### FAQs
- `POST /api/faqs/generate` - Generate FAQs from text
  ```json
  {
    "text": "Your text content here..."
  }
  ```

- `POST /api/faqs/save` - Save FAQs to database
  ```json
  {
    "faqs": [
      {
        "question": "Question?",
        "answer": "Answer.",
        "status": "draft"
      }
    ]
  }
  ```

- `GET /api/faqs` - List all FAQs
  - Query params: `?status=draft` or `?status=published`

- `PUT /api/faqs/:id` - Update a FAQ
  ```json
  {
    "question": "Updated question?",
    "answer": "Updated answer.",
    "status": "published"
  }
  ```

## Project Structure

```
backend/
├── server.js                 # Entry point
├── db.js                     # MongoDB connection
├── .env                      # Environment variables (create from .env.example)
├── package.json
└── src/
    ├── app.js                # Express app configuration
    ├── routes/
    │   ├── index.js         # Main router
    │   └── faqRoutes.js     # FAQ routes
    ├── controllers/
    │   └── faqController.js # Business logic
    ├── services/
    │   ├── crawlerService.js # Web crawling
    │   └── claudeService.js  # Claude API integration
    ├── models/
    │   ├── CrawledPage.js   # Crawled page schema
    │   └── FAQ.js           # FAQ schema
    ├── middleware/
    │   ├── errorHandler.js  # Error handling
    │   └── validator.js      # Request validation
    └── utils/
        └── constants.js     # App constants
```

## Environment Variables

See `.env.example` for required environment variables:

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `NODE_ENV` - Environment (development/production)

## Development

Run the server:
```bash
npm start
```

## License

ISC



