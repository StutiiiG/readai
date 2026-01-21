# DeepTutor - AI Research Assistant

## Original Problem Statement
Build a website like DeepTutor (https://deeptutor.knowhiz.us/) - an AI-powered research assistant to help industry researchers and graduate students save time switching between their file library and an AI tool. Make the results as accurate as possible and the UI beautiful and minimal.

## User Choices
- **AI Model**: Claude Sonnet 4.5 (via Emergent LLM Key)
- **File Support**: PDF, DOCX, TXT, Images
- **Core Features**: File upload + AI Q&A with citations
- **Authentication**: JWT-based (email/password)

## Architecture

### Tech Stack
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: Claude Sonnet 4.5 via emergentintegrations library

### Key Files
- `/app/backend/server.py` - Main API with auth, file handling, chat
- `/app/frontend/src/pages/Landing.js` - Landing page
- `/app/frontend/src/pages/Login.js` - Login page
- `/app/frontend/src/pages/Signup.js` - Registration page
- `/app/frontend/src/pages/Dashboard.js` - Main app with file upload & chat
- `/app/frontend/src/context/AuthContext.js` - Auth state management

## User Personas
1. **Graduate Students** - Need to analyze research papers for thesis/dissertation
2. **PhD Candidates** - Compare multiple papers and extract citations
3. **Industry Researchers** - Quick document analysis for R&D work

## Core Requirements (Static)
- [x] User authentication (register/login/logout)
- [x] File upload (PDF, DOCX, TXT, Images)
- [x] Session management (create, list, delete)
- [x] AI-powered Q&A with document context
- [x] Citation extraction and display
- [x] Chat history persistence
- [x] Beautiful, minimal UI design

## What's Been Implemented (January 2025)
1. **Full Authentication System**
   - JWT-based auth with bcrypt password hashing
   - Protected routes and token verification
   
2. **Document Processing**
   - PDF text extraction with page numbers
   - DOCX file parsing
   - TXT file reading
   - Image support (base64 encoding)

3. **AI Chat Integration**
   - Claude Sonnet 4.5 integration via Emergent LLM Key
   - Context-aware responses using uploaded documents
   - Citation extraction with [1], [2] markers
   
4. **Session Management**
   - Create/delete chat sessions
   - Auto-rename sessions based on first message
   - Persistent message history

5. **UI/UX**
   - Landing page with hero section and features
   - Modern academic design (Fraunces + IBM Plex Sans fonts)
   - Sidebar with session list
   - Drag-and-drop file upload
   - Citation tooltips on hover
   - Typing indicators and animations

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✅

### P1 (High Priority)
- [ ] Multi-file comparison analysis
- [ ] PDF page-level citations (show exact page)
- [ ] Download chat transcripts
- [ ] Search within documents

### P2 (Medium Priority)
- [ ] Folder organization for sessions
- [ ] Dark mode toggle
- [ ] Export citations to BibTeX
- [ ] Collaborative sessions (share with team)

### P3 (Nice to Have)
- [ ] Zotero integration
- [ ] Google Drive/Dropbox import
- [ ] Voice input for questions
- [ ] Mobile app

## Next Tasks
1. Add multi-document comparison feature
2. Implement document search functionality
3. Add citation export (BibTeX format)
4. Consider premium tier with higher usage limits
