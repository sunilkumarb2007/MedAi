import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout, theme } from 'antd';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { PanelLeft } from 'lucide-react';

const { Content } = Layout;

function ProtectedRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [chats, setChats] = React.useState([]);
  const [activeChatId, setActiveChatId] = React.useState(null);

  // Load chats on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("medai_all_chats");
    const savedActiveId = localStorage.getItem("medai_active_chat_id");
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      
      // If there's a saved active ID and it exists in the list, use it
      if (savedActiveId && parsedChats.find(c => c.id.toString() === savedActiveId.toString())) {
        setActiveChatId(savedActiveId);
      } else if (parsedChats.length > 0) {
        setActiveChatId(parsedChats[0].id);
      }
    }
  }, []);

  // Sync chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("medai_all_chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Sync activeChatId to localStorage
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("medai_active_chat_id", activeChatId);
    }
  }, [activeChatId]);

  return (
    <Layout className="flex h-screen overflow-hidden bg-surface-light dark:bg-surface-dark relative">
      
      {/* SIDEBAR WRAPPER with sliding animation */}
      <div className={`transition-all duration-300 ease-in-out h-full z-50 ${sidebarOpen ? 'w-[260px]' : 'w-0'}`}>
         <Sidebar 
           collapsed={!sidebarOpen} 
           chats={chats} 
           activeChatId={activeChatId}
           setChats={setChats}
           setActiveChatId={setActiveChatId}
         />
      </div>

      <Layout className="flex-1 flex flex-col relative bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300">
        
        {/* Toggle Sidebar Button (Global) */}
        {!sidebarOpen && (
           <div className="absolute top-4 left-4 z-40">
             <button onClick={() => setSidebarOpen(true)} className="p-2.5 rounded-lg hover:bg-chat-light dark:hover:bg-chat-dark text-text-secondary transition-colors border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-soft">
               <PanelLeft size={20} />
             </button>
           </div>
        )}

        <Content className="flex flex-col flex-1 overflow-hidden">
          <Routes>
            <Route path="/chat" element={
              <Chat 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                chats={chats} 
                activeChatId={activeChatId}
                setChats={setChats}
                setActiveChatId={setActiveChatId}
              />
            } />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {

  useEffect(() => {
    // Force Dark Mode Default
    document.documentElement.classList.add('dark');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Only force redirect if they are physically trapped on the login screen
        if (window.location.pathname === '/login') {
           window.location.href = "/";
        }
      } else {
        localStorage.removeItem("user");
        
        // Prevent infinite reload loops by checking if they are already gracefully kicked out
        if (window.location.pathname !== '/login') {
           window.location.href = "/login";
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          fontFamily: "'Inter', sans-serif",
          colorPrimary: '#14b8a6', // primary-500
          borderRadius: 12,
          colorBgBase: '#0f1115',
          colorBgContainer: '#16181d',
          colorBorder: '#374151',
          colorTextBase: '#f9fafb'
        },
        components: {
          Layout: {
            bodyBg: 'transparent',
            headerBg: 'transparent',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
