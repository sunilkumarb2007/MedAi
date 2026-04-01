import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, User, LogOut, Plus, SquarePen, ChevronUp, Trash2 } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const { Sider } = Layout;

export default function Sidebar({ collapsed, chats, activeChatId, setChats, setActiveChatId }) {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch(e) {}

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = '/login';
  };

  const handleNewChat = () => {
     const newId = Date.now();
     const newChat = {
       id: newId,
       title: "New Chat",
       messages: [],
       createdAt: new Date().toISOString()
     };
     setChats(prev => [newChat, ...prev]);
     setActiveChatId(newId);
     navigate('/chat');
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    navigate('/chat');
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  if (collapsed) return null;

  return (
    <Sider 
      width={260} 
      theme="light"
      className="h-screen border-r border-border-light dark:border-border-dark z-50 bg-chat-light dark:bg-chat-dark flex flex-col"
    >
      <div className="flex flex-col h-full bg-chat-light dark:bg-chat-dark">
        
        {/* NEW CHAT BUTTON */}
        <div className="p-3">
          <button 
            onClick={handleNewChat} 
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-[14px] font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Plus size={18} />
              New Chat
            </span>
            <SquarePen size={16} className="opacity-60" />
          </button>
        </div>

        {/* CHAT HISTORY LIST */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar text-[13px] text-text-light dark:text-text-dark mt-2">
          <div className="text-[11px] font-semibold text-text-secondary mt-2 mb-3 px-2 flex justify-between items-center">
            History
          </div>
          
          <div className="space-y-1">
            {chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeChatId === chat.id 
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium border border-primary-500/20' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-light dark:text-text-dark'
                }`}
              >
                <div className="flex-1 truncate pr-6 text-[13.5px]">
                  {chat.title}
                </div>
                
                <button 
                  onClick={(e) => deleteChat(e, chat.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-50 text-text-secondary rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {chats.length === 0 && (
              <div className="text-center py-8 text-text-secondary text-xs opacity-60 italic">
                No conversations yet
              </div>
            )}
          </div>
        </div>

        {/* PROFILE SECTION WITH DROPDOWN */}
        {user && (
          <div className="p-3 mt-auto relative" ref={profileRef}>
            
            {openProfile && (
              <div className="absolute bottom-16 left-3 right-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button onClick={() => { navigate('/profile'); setOpenProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => { navigate('/settings'); setOpenProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <Settings size={16} /> Settings
                </button>
                <div className="h-px bg-border-light dark:bg-border-dark my-1.5 mx-1" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}

            <button 
              onClick={() => setOpenProfile(!openProfile)}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors focus:outline-none ${openProfile ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <img src={user?.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-light dark:border-border-dark" />
                <div className="overflow-hidden flex-1 truncate text-left">
                    <span className="text-[14px] font-medium text-text-light dark:text-text-dark">{user?.name}</span>
                </div>
                <ChevronUp size={16} className={`text-text-secondary transition-transform duration-200 ${openProfile ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </Sider>
  );
}
