# ReadAI : An AI-Powered Research Document Assistant

<div align="center">

![ReadAI Logo](https://img.shields.io/badge/ReadAI-Research%20Assistant-0F4C5C?style=for-the-badge&logo=bookopen&logoColor=white)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.5+-47A248.svg)](https://mongodb.com)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-orange.svg)](https://anthropic.com)

**Transform how you read and understand research documents with AI-powered analysis and citations.**

Live Demo: https://readai-tau.vercel.app/

</div>

---

##  What is ReadAI?

ReadAI is an intelligent research assistant designed for **graduate students**, **PhD candidates**, and **industry researchers**. Upload your documents, ask questions in natural language, and get accurate answers with proper citations—all in one place.

**Stop switching between your PDF reader and ChatGPT.** ReadAI brings them together.

##  Features

| Feature | Description |
|---------|-------------|
|  **Multi-Format Upload** | Support for PDF, DOCX, TXT files and images |
|  **Claude AI Integration** | Powered by Claude Sonnet 4.5 for accurate analysis |
|  **Citation Tracking** | Inline citations [1], [2] with source tooltips |
|  **Contextual Chat** | AI remembers your conversation and document context |
|  **Session Management** | Organize research into separate sessions |
|  **Secure Auth** | JWT-based authentication with encrypted passwords |
|  **Modern UI** | Clean, minimal academic design |

##  Screenshots

<details>
<summary>Click to view screenshots</summary>

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Dashboard with Chat
![Dashboard](docs/screenshots/dashboard.png)

### File Upload
![Upload](docs/screenshots/upload.png)

</details>

##  Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 4.5+
- Claude API key 

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/readai.git
cd readai
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Environment Variables**

Create `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=readai
JWT_SECRET=your-secure-secret-key
CLAUDE_API_KEY=your-api-key  
CORS_ORIGINS=http://localhost:3000
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

5. **Run the Application**

```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2 - Frontend
cd frontend
yarn start
```

Visit `http://localhost:3000`

## Usage

1. **Create an Account** - Sign up with your email
2. **Start a Session** - Click "New Session" in the sidebar
3. **Upload Documents** - Drag & drop your research papers
4. **Ask Questions** - Type your question and get AI-powered answers
5. **Review Citations** - Hover over [1], [2] to see sources

##  API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Login and get JWT |
| `/api/auth/me` | GET | Get current user |

### Sessions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List all sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/:id` | DELETE | Delete session |

### Files & Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files/upload` | POST | Upload document |
| `/api/files/session/:id` | GET | Get session files |
| `/api/chat` | POST | Send message & get AI response |
| `/api/messages/:session_id` | GET | Get chat history |

## Architecture

```
readai/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── uploads/           # Uploaded files storage
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # UI components
│   │   └── context/       # Auth context
│   └── package.json
└── README.md
```

## Deployment

### Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed guides on:
- Railway
- Render
- DigitalOcean
- AWS/GCP

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for researchers everywhere

</div>
