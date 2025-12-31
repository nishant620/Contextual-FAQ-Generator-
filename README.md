# Contextual FAQ Generator

> 


## 🎯 Overview

Contextual FAQ Generator is a full-stack web application that automates the creation of FAQs from website content. It crawls websites, extracts meaningful content, and uses OpenAI to generate relevant, contextual FAQs that can be edited, published, and exported.

### Key Capabilities

- **Web Crawling**: Automatically extracts and cleans content from any public website
- **AI-Powered Generation**: Uses OpenAI to generate contextual FAQs
- **Content Management**: Edit, publish, and manage FAQs through an intuitive admin dashboard
- **Export Functionality**: Export FAQs in JSON format for integration with other systems

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **OpenAI** - AI model for FAQ generation
- **Cheerio** - HTML parsing and web scraping
- **Axios** - HTTP client for web crawling

### Frontend
- **React.js** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## ✨ Features

- 🔍 **Smart Web Crawling**: Extracts clean, readable content from websites
- 🤖 **AI-Powered FAQ Generation**: Generates 5-10 contextual FAQs per website
- ✏️ **FAQ Management**: Edit questions and answers before publishing
- 📊 **Status Management**: Draft and published status for each FAQ
- 📥 **Export Functionality**: Export published FAQs as JSON
- 🎨 **Modern UI**: Clean, responsive Material-UI dashboard
- 🔒 **Error Handling**: Comprehensive error handling and validation
- 🌐 **URL Filtering**: View FAQs filtered by source website

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (v6.0 or higher) - Local installation or MongoDB Atlas account
- **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/contextual-faq-generator.git
cd contextual-faq-generator
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration (see Environment Variables section)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# macOS/Linux
mongod

# Windows
# Start MongoDB service from Services panel
```

**MongoDB Atlas:**
- Use your Atlas connection string in the `.env` file

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development


# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/faq-generator

# OpenAI API
OPENAI_API_KEY=sk-proj-your-api-key-here

# CORS (Optional)
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env) - Optional

Create a `.env` file in the `frontend/` directory (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Getting API Keys

**OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-` or `sk-`)
6. Add it to your `backend/.env` file

## 🔄 How It Works

### FAQ Generation Flow

1. **URL Input**: User enters a website URL in the dashboard
2. **Web Crawling**: 
   - System fetches the website HTML
   - Removes scripts, styles, navigation, and footer elements
   - Extracts clean, readable text content
   - Stores crawled content in MongoDB
3. **AI Processing**:
   - Cleaned text is sent to OpenAI
   - AI analyzes content and generates contextual FAQs
   - Returns structured FAQ data (question-answer pairs)
4. **Storage & Management**:
   - FAQs are saved to MongoDB with draft status
   - User can edit, publish, or delete FAQs
   - Published FAQs can be exported as JSON

### AI Model Configuration

- **Model**: `gpt-4o-mini` (fast and cost-effective)
- **Alternative**: `gpt-4`, `gpt-3.5-turbo` (better quality, slower)
- **Configuration**: Edit `backend/src/services/openaiService.js` line 126

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /health
```

#### Generate FAQs from URL
```http
POST /faqs/generate-faqs
Content-Type: application/json

{
  "url": "https://example.com",
  "count": 7
}
```

**Response:**
```json
{
  "message": "FAQs generated successfully",
  "faqs": {
    "count": 7,
    "ids": ["...", "..."]
  },
  "crawledPage": {
    "id": "...",
    "url": "https://example.com"
  }
}
```

#### List All FAQs
```http
GET /faqs
GET /faqs?status=published
GET /faqs?status=draft
```

#### Update FAQ
```http
PUT /faqs/:id
Content-Type: application/json

{
  "question": "Updated question?",
  "answer": "Updated answer"
}
```

#### Publish/Unpublish FAQ
```http
POST /faqs/:id/publish
```

#### Export FAQs
```http
GET /faqs/export
GET /faqs/export?format=json
```

#### Generate FAQs from Text (Standalone)
```http
POST /faqs/generate
Content-Type: application/json

{
  "text": "Your text content here...",
  "count": 5
}
```

For complete API documentation, see [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)

## 💻 Usage

### Basic Workflow

1. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

2. **Access the Dashboard**
   - Open http://localhost:3000 in your browser
   - Navigate to the Dashboard

3. **Generate FAQs**
   - Enter a website URL (e.g., `https://example.com`)
   - Set FAQ count (5-10)
   - Click "Generate FAQs"
   - Wait for processing (crawling + AI generation)

4. **Manage FAQs**
   - View generated FAQs in the table
   - Edit questions/answers using the edit icon
   - Publish/unpublish FAQs
   - Export published FAQs as JSON

### Example URLs That Work Well

- `https://example.com`
- `https://www.wikipedia.org`
- Public documentation sites
- Company homepages
- Blog posts

**Note**: Some websites may block automated requests. See [CRAWLER_TROUBLESHOOTING.md](./CRAWLER_TROUBLESHOOTING.md) for solutions.

## 📁 Project Structure

```
contextual-faq-generator/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (crawler, AI)
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.js           # Main app component
│   └── package.json
├── README.md
└── ...
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or use MongoDB Atlas connection string.

**2. OpenAI API Key Error**
```
OPENAI_API_KEY is not defined
```
**Solution**: Add your API key to `backend/.env` file.

**3. HTTP 403 Forbidden (Crawler)**
```
HTTP 403: Access Forbidden
```
**Solution**: Some websites block automated requests. Try a different website or see [CRAWLER_TROUBLESHOOTING.md](./CRAWLER_TROUBLESHOOTING.md).

**4. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` or kill the process using the port.

### Getting Help

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions
- Review [CRAWLER_TROUBLESHOOTING.md](./CRAWLER_TROUBLESHOOTING.md) for crawler-specific issues
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup instructions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [Material-UI](https://mui.com/) for UI components
- [Cheerio](https://cheerio.js.org/) for HTML parsing

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation in the repository
- Review the troubleshooting guides

---

**Made with ❤️ using Node.js, React, and OpenAI**

