import React, { useState } from 'react';
import { Typography, Button, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      };

      localStorage.setItem("user", JSON.stringify(userData));

      window.location.reload();
    } catch (error) {
      console.error("Login Error:", error);
      message.error("Login failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-chat-light dark:bg-chat-dark rounded-3xl shadow-soft p-12 relative z-10 flex flex-col items-center text-center border border-border-light dark:border-border-dark">
        <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl mb-6 shadow-sm">
          <span className="material-symbols-outlined">health_and_safety</span>
        </div>
        
        <Title level={2} className="text-text-light dark:text-text-dark font-semibold tracking-tight m-0 mb-2">MedAI Clinical</Title>
        <Text className="text-text-secondary mb-10 block text-base">Secure intelligence suite for clinical workflows.</Text>
        
        <Button 
          type="primary" 
          size="large" 
          icon={<GoogleOutlined />} 
          onClick={handleLogin}
          loading={loading}
          className="w-full h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm text-base font-semibold transition-all flex items-center justify-center"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
