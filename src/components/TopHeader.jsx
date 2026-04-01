import React, { useState } from 'react';
import { Layout, Dropdown, Avatar, Button, Typography } from 'antd';
import { DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const { Header } = Layout;
const { Text } = Typography;

export default function TopHeader() {
  const navigate = useNavigate();
  const initialModel = localStorage.getItem('medai_model_version') || 'v2';
  const [model, setModel] = useState(initialModel);
  
  // STEP 4 - Show REAL Profile
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch(e) {}
  
  const handleModelChange = (key) => {
    setModel(key);
    localStorage.setItem('medai_model_version', key);
    window.dispatchEvent(new Event('model_changed'));
  };

  const modelItems = [
    { key: 'v1', label: 'v1 Basic (Fast)' },
    { key: 'v2', label: 'v2 Advanced' },
    { key: 'v3', label: 'v3 Pro (Deep)' },
  ];

  // STEP 5 - Logout
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.reload();
  };

  const profileItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign out',
      onClick: handleLogout
    }
  ];

  const getModelLabel = () => modelItems.find(i => i.key === model)?.label || 'v2 Advanced';

  return (
    <Header className="w-full h-16 sticky top-0 z-40 bg-[#f9f9fb]/90 backdrop-blur-xl flex justify-between items-center px-8 border-b border-zinc-200/50" style={{ paddingInline: '2rem' }}>
      <div className="flex items-center gap-4">
        <span className="md:hidden text-lg font-bold text-[#065f46]">MedAI</span>
      </div>
      <div className="flex items-center gap-6">
        <Dropdown menu={{ items: modelItems, onClick: ({key}) => handleModelChange(key) }} trigger={['click']}>
          <Button type="default" shape="round" className="font-semibold text-xs tracking-wide bg-white border-zinc-200 text-zinc-700 shadow-sm flex items-center justify-center gap-2">
            Model: {getModelLabel()} <DownOutlined className="text-[10px]" />
          </Button>
        </Dropdown>
        
        {user && (
          <Dropdown menu={{ items: profileItems }} trigger={['click']} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-100 p-1 pr-3 rounded-full transition-colors">
              <Avatar src={user?.photo} className="border border-zinc-200">
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Text className="hidden md:block font-medium text-sm text-zinc-700">
                {user?.name || 'User'}
              </Text>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  );
}
