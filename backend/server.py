from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import PyPDF2
from docx import Document
from PIL import Image
import io
import base64
import aiofiles
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# File storage directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== Models ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SessionCreate(BaseModel):
    title: Optional[str] = "New Session"

class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    file_ids: List[str] = []

class MessageCreate(BaseModel):
    content: str
    session_id: str

class Citation(BaseModel):
    number: int
    text: str
    source: str
    page: Optional[int] = None

class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: List[Citation] = []
    created_at: str

class FileResponse(BaseModel):
    id: str
    user_id: str
    session_id: str
    filename: str
    file_type: str
    file_size: int
    created_at: str

# ==================== Auth Helpers ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== File Processing ====================

async def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n[Page {page_num + 1}]\n{page_text}"
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
    return text

async def extract_text_from_docx(file_path: str) -> str:
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
    return text

async def extract_text_from_txt(file_path: str) -> str:
    try:
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            return await f.read()
    except Exception as e:
        logger.error(f"Error reading TXT file: {e}")
        return ""

async def process_image(file_path: str) -> str:
    try:
        with open(file_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        return f"[Image content - base64 encoded for analysis]"
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return ""

async def get_file_content(file_doc: dict) -> str:
    file_path = UPLOAD_DIR / file_doc['stored_filename']
    file_type = file_doc['file_type'].lower()
    
    if file_type == 'pdf':
        return await extract_text_from_pdf(str(file_path))
    elif file_type == 'docx':
        return await extract_text_from_docx(str(file_path))
    elif file_type == 'txt':
        return await extract_text_from_txt(str(file_path))
    elif file_type in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
        return await process_image(str(file_path))
    return ""

# ==================== Auth Routes ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"]
    )

# ==================== Session Routes ====================

@api_router.post("/sessions", response_model=SessionResponse)
async def create_session(data: SessionCreate, user: dict = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    session_doc = {
        "id": session_id,
        "user_id": user["id"],
        "title": data.title,
        "created_at": now,
        "updated_at": now,
        "file_ids": []
    }
    await db.sessions.insert_one(session_doc)
    return SessionResponse(**{k: v for k, v in session_doc.items() if k != '_id'})

@api_router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(user: dict = Depends(get_current_user)):
    sessions = await db.sessions.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    return [SessionResponse(**s) for s in sessions]

@api_router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one(
        {"id": session_id, "user_id": user["id"]}, 
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**session)

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    result = await db.sessions.delete_one({"id": session_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.messages.delete_many({"session_id": session_id})
    await db.files.delete_many({"session_id": session_id})
    return {"message": "Session deleted"}

@api_router.patch("/sessions/{session_id}")
async def update_session(session_id: str, data: SessionCreate, user: dict = Depends(get_current_user)):
    result = await db.sessions.update_one(
        {"id": session_id, "user_id": user["id"]},
        {"$set": {"title": data.title, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session updated"}

# ==================== File Routes ====================

@api_router.post("/files/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    user: dict = Depends(get_current_user)
):
    session = await db.sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    filename = file.filename
    file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    allowed_types = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'webp']
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {', '.join(allowed_types)}")
    
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}.{file_ext}"
    file_path = UPLOAD_DIR / stored_filename
    
    content = await file.read()
    file_size = len(content)
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    file_doc = {
        "id": file_id,
        "user_id": user["id"],
        "session_id": session_id,
        "filename": filename,
        "stored_filename": stored_filename,
        "file_type": file_ext,
        "file_size": file_size,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.files.insert_one(file_doc)
    
    await db.sessions.update_one(
        {"id": session_id},
        {
            "$push": {"file_ids": file_id},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return FileResponse(**{k: v for k, v in file_doc.items() if k not in ['_id', 'stored_filename']})

@api_router.get("/files/session/{session_id}", response_model=List[FileResponse])
async def get_session_files(session_id: str, user: dict = Depends(get_current_user)):
    files = await db.files.find(
        {"session_id": session_id, "user_id": user["id"]},
        {"_id": 0, "stored_filename": 0}
    ).to_list(100)
    return [FileResponse(**f) for f in files]

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str, user: dict = Depends(get_current_user)):
    file_doc = await db.files.find_one({"id": file_id, "user_id": user["id"]})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = UPLOAD_DIR / file_doc['stored_filename']
    if file_path.exists():
        file_path.unlink()
    
    await db.files.delete_one({"id": file_id})
    await db.sessions.update_one(
        {"id": file_doc["session_id"]},
        {"$pull": {"file_ids": file_id}}
    )
    return {"message": "File deleted"}

# ==================== Chat Routes ====================

@api_router.get("/messages/{session_id}", response_model=List[MessageResponse])
async def get_messages(session_id: str, user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = await db.messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    return [MessageResponse(**m) for m in messages]

@api_router.post("/chat", response_model=MessageResponse)
async def chat(data: MessageCreate, user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": data.session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_msg_id = str(uuid.uuid4())
    user_msg = {
        "id": user_msg_id,
        "session_id": data.session_id,
        "role": "user",
        "content": data.content,
        "citations": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(user_msg)
    
    # Get session files and extract content
    files = await db.files.find({"session_id": data.session_id}).to_list(100)
    document_context = ""
    source_mapping = {}
    
    for i, file_doc in enumerate(files, 1):
        content = await get_file_content(file_doc)
        if content:
            source_mapping[i] = file_doc['filename']
            document_context += f"\n\n=== Source [{i}]: {file_doc['filename']} ===\n{content}"
    
    # Get chat history
    history = await db.messages.find(
        {"session_id": data.session_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    history.reverse()
    
    history_text = ""
    for msg in history[:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"\n{role}: {msg['content']}"
    
    # Generate AI response
    system_prompt = """You are DeepTutor, an expert AI research assistant helping researchers and graduate students analyze academic documents. 

Your responses must:
1. Be accurate, comprehensive, and directly address the user's question
2. Include inline citations like [1], [2] referring to specific sources when you reference information
3. Use clear academic language appropriate for researchers
4. If the question cannot be answered from the provided documents, say so clearly

Format your response naturally with citations inline where you use information from the documents."""

    if document_context:
        user_prompt = f"""Based on the following documents:
{document_context}

Previous conversation:
{history_text}

User question: {data.content}

Please provide a detailed, accurate response with citations [1], [2], etc. referencing the specific documents."""
    else:
        user_prompt = f"""Previous conversation:
{history_text}

User question: {data.content}

Note: No documents have been uploaded to this session yet. Please let the user know they should upload documents for analysis, but still try to help with their question if possible."""

    try:
        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"deeptutor-{data.session_id}-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        response = await chat_client.send_message(UserMessage(text=user_prompt))
        ai_content = response
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        ai_content = "I apologize, but I encountered an error while processing your request. Please try again."
    
    # Extract citations from response
    citations = []
    import re
    citation_matches = re.findall(r'\[(\d+)\]', ai_content)
    seen_citations = set()
    for match in citation_matches:
        num = int(match)
        if num in source_mapping and num not in seen_citations:
            seen_citations.add(num)
            citations.append(Citation(
                number=num,
                text=f"Reference from {source_mapping[num]}",
                source=source_mapping[num]
            ))
    
    # Save AI response
    ai_msg_id = str(uuid.uuid4())
    ai_msg = {
        "id": ai_msg_id,
        "session_id": data.session_id,
        "role": "assistant",
        "content": ai_content,
        "citations": [c.model_dump() for c in citations],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(ai_msg)
    
    # Update session timestamp and title if first message
    message_count = await db.messages.count_documents({"session_id": data.session_id})
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if message_count <= 2:
        update_data["title"] = data.content[:50] + ("..." if len(data.content) > 50 else "")
    await db.sessions.update_one({"id": data.session_id}, {"$set": update_data})
    
    return MessageResponse(**{k: v for k, v in ai_msg.items() if k != '_id'})

# ==================== Status Routes ====================

@api_router.get("/")
async def root():
    return {"message": "DeepTutor API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router and setup middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
