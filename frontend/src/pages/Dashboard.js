import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  BookOpen,
  Plus,
  Send,
  Upload,
  FileText,
  Image,
  Trash2,
  LogOut,
  MoreVertical,
  Menu,
  X,
  Loader2,
  File,
  ChevronRight
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// File type icon component
const FileIcon = ({ type }) => {
  const iconClass = `file-icon file-icon-${type === 'pdf' ? 'pdf' : type === 'docx' ? 'docx' : type.match(/^(png|jpg|jpeg|gif|webp)$/) ? 'image' : 'txt'}`;
  return (
    <div className={iconClass}>
      {type === 'pdf' ? 'PDF' : type === 'docx' ? 'DOC' : type.match(/^(png|jpg|jpeg|gif|webp)$/) ? 'IMG' : 'TXT'}
    </div>
  );
};

// Citation component
const CitationMarker = ({ number, source }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="citation-marker">[{number}]</span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">Source: {source}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Process citation text
const processCitationText = (text, citations) => {
  if (typeof text !== 'string') return text;
  
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const match = part.match(/\[(\d+)\]/);
    if (match) {
      const num = parseInt(match[1]);
      const citation = citations.find(c => c.number === num);
      return <CitationMarker key={i} number={num} source={citation?.source || 'Unknown'} />;
    }
    return part;
  });
};

// Paragraph component for ReactMarkdown
const createParagraphRenderer = (citations) => {
  const ParagraphRenderer = ({ children }) => {
    if (typeof children === 'string') {
      return <p>{processCitationText(children, citations)}</p>;
    }
    return <p>{children}</p>;
  };
  return ParagraphRenderer;
};

// Process message content to render citations
const MessageContent = ({ content, citations }) => {
  const components = {
    p: createParagraphRenderer(citations)
  };
  
  return (
    <div className="prose-content">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Typing indicator
const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-4">
    <div className="typing-dot" />
    <div className="typing-dot" />
    <div className="typing-dot" />
  </div>
);

export default function Dashboard() {
  const { user, logout, getAuthHeader } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch messages and files when session changes
  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
      fetchFiles(currentSession.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`, getAuthHeader());
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/messages/${sessionId}`, getAuthHeader());
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchFiles = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/files/session/${sessionId}`, getAuthHeader());
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await axios.post(
        `${API}/sessions`,
        { title: 'New Session' },
        getAuthHeader()
      );
      setSessions(prev => [response.data, ...prev]);
      setCurrentSession(response.data);
      setMessages([]);
      setFiles([]);
      toast.success('New session created');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/sessions/${sessionId}`, getAuthHeader());
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setFiles([]);
      }
      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!currentSession) {
      toast.error('Please create or select a session first');
      return;
    }

    setIsLoading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', currentSession.id);

      try {
        const response = await axios.post(
          `${API}/files/upload`,
          formData,
          {
            ...getAuthHeader(),
            headers: {
              ...getAuthHeader().headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setFiles(prev => [...prev, response.data]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setIsLoading(false);
  }, [currentSession, getAuthHeader]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`${API}/files/${fileId}`, getAuthHeader());
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentSession || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: 'temp-user',
      role: 'user',
      content: userMessage,
      citations: [],
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await axios.post(
        `${API}/chat`,
        {
          content: userMessage,
          session_id: currentSession.id
        },
        getAuthHeader()
      );

      // Update messages with actual response
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== 'temp-user');
        return [...withoutTemp, { ...tempUserMsg, id: response.data.id.replace('temp-user', '') }, response.data];
      });

      // Update session title if first message
      if (messages.length === 0) {
        const updatedTitle = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
        setSessions(prev => 
          prev.map(s => s.id === currentSession.id ? { ...s, title: updatedTitle } : s)
        );
        setCurrentSession(prev => ({ ...prev, title: updatedTitle }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'hidden md:flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground" style={{ fontFamily: 'Fraunces, serif' }}>
                ReadAI
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <Button 
            onClick={createSession} 
            className="w-full gap-2"
            data-testid="new-session-btn"
          >
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item flex items-center gap-2 p-3 rounded-lg cursor-pointer group ${
                  currentSession?.id === session.id ? 'active' : ''
                }`}
                onClick={() => setCurrentSession(session)}
                data-testid={`session-item-${session.id}`}
              >
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 truncate text-sm">{session.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`session-menu-${session.id}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => deleteSession(session.id)}
                      className="text-destructive"
                      data-testid={`delete-session-${session.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <div className="md:hidden glass-header p-4 border-b border-border flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            data-testid="open-sidebar-btn"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-medium">{currentSession?.title || 'ReadAI'}</span>
        </div>

        {!currentSession ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="empty-state max-w-md animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-medium text-foreground mb-3">Welcome to ReadAI</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Start a new session to upload your research documents and begin asking questions.
              </p>
              <Button onClick={createSession} className="gap-2" data-testid="empty-new-session-btn">
                <Plus className="w-4 h-4" />
                Create Your First Session
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="chat-container py-8">
                {/* Upload Zone (shown when no messages) */}
                {messages.length === 0 && (
                  <div className="animate-fade-in">
                    <div
                      {...getRootProps()}
                      className={`upload-zone p-8 text-center cursor-pointer mb-6 ${isDragActive ? 'drag-active' : ''}`}
                      data-testid="upload-dropzone"
                    >
                      <input {...getInputProps()} data-testid="file-input" />
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {isDragActive ? 'Drop files here' : 'Upload Your Documents'}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Drag & drop or click to upload PDF, DOCX, TXT, or images
                      </p>
                    </div>

                    {/* Files List */}
                    {files.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Uploaded Files</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {files.map((file) => (
                            <div key={file.id} className="file-card flex items-center gap-3" data-testid={`file-card-${file.id}`}>
                              <FileIcon type={file.file_type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFile(file.id)}
                                className="flex-shrink-0"
                                data-testid={`delete-file-${file.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center text-muted-foreground">
                      <p className="mb-2">Ready to analyze your documents?</p>
                      <p className="text-sm flex items-center justify-center gap-1">
                        Type a question below <ChevronRight className="w-4 h-4" />
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                  <div className="space-y-6">
                    {/* Files summary */}
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {files.map((file) => (
                          <div 
                            key={file.id} 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                          >
                            <File className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{file.filename}</span>
                          </div>
                        ))}
                        <div
                          {...getRootProps()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-sm cursor-pointer hover:bg-muted/80"
                        >
                          <input {...getInputProps()} />
                          <Plus className="w-3 h-3" />
                          <span>Add file</span>
                        </div>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div
                          className={`max-w-[85%] ${
                            message.role === 'user' ? 'message-user px-4 py-3' : 'message-assistant p-4'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <MessageContent content={message.content} citations={message.citations || []} />
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {isSending && (
                      <div className="flex justify-start">
                        <div className="message-assistant">
                          <TypingIndicator />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 pb-6">
              <div className="chat-container">
                <div className="input-area flex items-center gap-3 p-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            data-testid="upload-btn"
                          >
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Upload className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Upload files</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your documents..."
                    className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
                    disabled={isSending}
                    data-testid="chat-input"
                  />

                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isSending}
                    size="icon"
                    data-testid="send-btn"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
