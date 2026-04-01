import React, { useState, useRef, useEffect } from 'react';
import { Typography, Input, Tooltip, Button, message } from 'antd';
import { Paperclip, Mic, Send, Square, Moon, Sun, Copy, Bookmark, Sparkles, PanelLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchMessage, uploadFile } from '../services/chat';

// Check for Browser Voice Support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Chat({ sidebarOpen, setSidebarOpen, chats, activeChatId, setChats, setActiveChatId }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync with Active Chat
  const currentChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeChatId, chats]);

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll logic
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      message.success(`Attached: ${f.name}`);
    }
  };

  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      message.error("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleStop = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
      }
      setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard");
  };

  const updateGlobalHistory = (newMessages, newTitle = null) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { 
          ...chat, 
          messages: newMessages,
          title: newTitle || chat.title
        };
      }
      return chat;
    }));
  };

  const handleSend = async (overrideInput = null) => {
    const currentInput = overrideInput !== null ? overrideInput : inputVal;
    
    if (!currentInput.trim() && !file) return;

    // Auto-create chat if none active
    if (!activeChatId) {
       const newId = Date.now();
       const newChat = { id: newId, title: "New Chat", messages: [] };
       setChats(prev => [newChat, ...prev]);
       setActiveChatId(newId);
       return; // Let the next cycle pick it up or immediately use locally
    }

    let uiCurrentInput = currentInput;
    if (file && !uiCurrentInput) {
       uiCurrentInput = `Uploaded document: ${file.name}`;
    }

    const newMessageId = Date.now();
    const isFirstMessage = messages.length === 0;

    const userMsg = { 
      id: newMessageId + '_u',
      role: 'user', 
      content: uiCurrentInput, 
      attachedFile: file ? file.name : null, 
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setLoading(true);
    setIsAtBottom(true);

    // Update title on first message
    const dynamicTitle = isFirstMessage ? currentInput.slice(0, 30).trim() + (currentInput.length > 30 ? "..." : "") : null;
    updateGlobalHistory(updatedMessages, dynamicTitle);

    // AI placeholder
    const aiPlaceholder = {
      id: newMessageId,
      role: 'ai',
      content: '', 
      statusText: 'Thinking...',
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      abortControllerRef.current = new AbortController();

      if (file) {
        const upRes = await uploadFile(file);
        const finalMsg = { ...aiPlaceholder, content: upRes.reply || 'File processed.', statusText: null };
        const finalMessages = updatedMessages.map(m => m.id === newMessageId ? finalMsg : m);
        setMessages(finalMessages);
        updateGlobalHistory(finalMessages);
        setFile(null);
      } else {
        const historyContext = updatedMessages.map(m => ({ role: m.role, content: m.content }));
        const response = await fetchMessage(currentInput, historyContext, abortControllerRef.current.signal);
        const finalAIContent = response.reply || "Something went wrong.";
        
        const finalMsg = { ...aiPlaceholder, content: finalAIContent, statusText: null };
        const finalMessages = [...updatedMessages, finalMsg];
        
        setMessages(finalMessages);
        updateGlobalHistory(finalMessages);
      }
    } catch (error) {
       if (error.name === 'AbortError') {
           console.log("Stream stopped");
       } else {
           const errMsg = { ...aiPlaceholder, content: "Something went wrong. Please try again.", statusText: null };
           const finalMessages = updatedMessages.map(m => m.id === newMessageId ? errMsg : m);
           setMessages(finalMessages);
           updateGlobalHistory(finalMessages);
       }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      
      {/* HEADER BAR */}
      <div className="h-14 flex items-center justify-between px-4 z-40 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 border-b border-border-light/10 dark:border-border-dark/10">
         <div className="flex items-center gap-2">
            {!sidebarOpen && (
               <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-chat-light dark:bg-chat-dark text-text-secondary transition-colors">
                  <PanelLeft size={20} />
               </button>
            )}
            <div className="text-[14px] font-semibold text-text-light dark:text-text-dark ml-2">
                {currentChat?.title || "Medical Intelligence v3"}
            </div>
         </div>
         
         <div className="flex items-center gap-2">
           <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg hover:bg-chat-light dark:bg-chat-dark text-text-secondary transition-colors">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
           </button>
         </div>
      </div>

      {/* HEADER HERO (DeepSeek / ChatGPT Clean) */}
      {!messages.length && (
        <div className="flex-1 flex items-center justify-center flex-col px-4 animate-in fade-in zoom-in duration-500">
            <h1 className="text-3xl font-semibold text-text-light dark:text-text-dark mb-2 tracking-tight">How can I help you today?</h1>
            <p className="text-[15px] text-text-secondary max-w-[500px] text-center mb-8">
                Ask a medical question, request a differential diagnosis, or upload clinical notes for review.
            </p>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto w-full custom-scrollbar ${!messages.length ? 'hidden' : ''}`}
      >
        <div className="max-w-[680px] w-full mx-auto px-4 py-8 pb-48 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end md:pl-16' : 'justify-start md:pr-12 group animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
              
              {msg.role === 'user' ? (
                <div className="bg-[#f3f4f6] dark:bg-[#1f2937] text-text-light dark:text-text-dark px-5 py-3 rounded-3xl rounded-tr-sm text-[15px] leading-relaxed shadow-soft">
                  {msg.attachedFile && (
                    <div className="mb-2 text-xs font-semibold flex items-center gap-1 opacity-70">
                       <Paperclip size={12}/> {msg.attachedFile}
                    </div>
                  )}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              ) : (
                <div className="flex gap-4 w-full text-[15px] text-text-light dark:text-text-dark leading-loose">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5">
                      <Sparkles size={14} />
                  </div>
                  
                  <div className="flex-1 min-w-0 premium-markdown pt-0.5">
                    {msg.statusText && !msg.content ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-text-secondary font-medium text-[15px] h-8 animate-pulse italic">
                            {msg.statusText}
                        </div>
                      </div>
                    ) : (
                      <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                        </ReactMarkdown>

                        {(!loading || idx !== messages.length - 1) && (
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button onClick={() => copyToClipboard(msg.content)} className="p-1.5 text-text-secondary hover:bg-chat-light dark:bg-chat-dark rounded-md transition-colors"><Copy size={14}/></button>
                            <button className="p-1.5 text-text-secondary hover:bg-chat-light dark:bg-chat-dark rounded-md transition-colors"><Bookmark size={14}/></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* BOTTOM INPUT BAR */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md pt-4 pb-6 px-4">
        <div className="max-w-[680px] w-full mx-auto relative">
          
          <div className="bg-chat-light dark:bg-chat-dark border border-border-light dark:border-border-dark rounded-[24px] p-2 flex flex-col shadow-soft focus-within:border-primary-500/50 transition-all duration-200">
            
            <div className="flex items-end gap-2 p-1">
              <Button type="text" shape="circle" icon={<Paperclip size={18} className="text-text-secondary" />} onClick={() => fileInputRef.current?.click()} size="large" className="shrink-0" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              
              <Input.TextArea 
                size="large"
                placeholder="Message Medical AI..."
                variant="borderless"
                autoSize={{ minRows: 1, maxRows: 8 }}
                className="flex-1 text-[15px] py-3 px-1 custom-scrollbar bg-transparent text-text-light dark:text-text-dark placeholder:text-text-secondary focus:ring-0"
                value={inputVal}
                disabled={loading}
                onChange={e => setInputVal(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              
              <div className="flex items-center gap-1 pb-1 pr-1 shrink-0">
                {!loading && <Button type="text" shape="circle" icon={<Mic size={18} className={isListening ? 'text-red-500 animate-pulse' : 'text-text-secondary'} />} size="large" onClick={handleVoiceInput} />}
                
                {loading ? (
                  <Tooltip title="Stop Generating">
                    <Button type="text" shape="circle" icon={<Square size={16} fill="currentColor" />} className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-zinc-300 dark:text-zinc-900 text-white flex items-center justify-center w-10 h-10 transition-transform active:scale-90" onClick={handleStop} />
                  </Tooltip>
                ) : (
                  <Button type="text" shape="circle" icon={<Send size={16} />} className={`flex items-center justify-center w-10 h-10 transition-all ${!inputVal.trim() && !file ? 'bg-zinc-100 dark:bg-zinc-800 text-text-secondary' : 'bg-primary-600 hover:bg-primary-700 text-white'}`} disabled={!inputVal.trim() && !file} onClick={() => handleSend()} />
                )}
              </div>
            </div>

            <div className="text-center mt-2 pb-1">
               <span className="text-[11px] text-text-secondary font-medium tracking-tight">AI can make mistakes. Always verify critical medical info.</span>
            </div>
            
          </div>
        </div>
      </div>
    
      {!isAtBottom && messages.length > 0 && (
         <button onClick={scrollToBottom} className="absolute bottom-32 right-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-2 rounded-full shadow-soft text-text-secondary hover:text-text-light dark:hover:text-text-dark transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
         </button>
      )}

    </div>
  );
}
