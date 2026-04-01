import React from 'react';
import { Typography, Card, Avatar, Button, List, Switch, Row, Col } from 'antd';
import { EditOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons';
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const { Title, Text } = Typography;

export default function Profile() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch(e) {}

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.reload();
  };

  const precisionLabel = localStorage.getItem('medai_precision') || 'Standard';

  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark transition-colors duration-300 overflow-y-auto h-full px-8 md:px-20 py-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <Card className="rounded-xl border-border-light dark:border-border-dark shadow-soft bg-chat-light dark:bg-chat-dark mt-10" bodyStyle={{ padding: '32px' }}>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
              <Avatar size={160} shape="square" className="rounded-2xl" src={user?.photo}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Button shape="circle" type="primary" icon={<EditOutlined />} className="absolute -bottom-2 -right-2 shadow-lg bg-primary-600 border-none hover:bg-primary-700" size="large" />
            </div>
            <div className="text-center md:text-left flex-1 pt-2">
              <Title level={1} className="text-text-light dark:text-text-dark m-0 font-extrabold tracking-tight">{user?.name || 'Authorized User'}</Title>
              <Text className="text-xl text-text-secondary block mt-2">Clinical Practitioner</Text>
              <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-border-light dark:border-border-dark">Connected with Google</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">Verified Account</span>
              </div>
            </div>
          </div>
        </Card>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div className="space-y-4">
              <Title level={5} className="uppercase tracking-widest text-text-secondary m-0 pl-2 text-sm font-bold">Personal Information</Title>
              <Card className="rounded-xl border-border-light dark:border-border-dark shadow-soft bg-chat-light dark:bg-chat-dark" bodyStyle={{ padding: 0 }}>
                <List split={true}>
                  <List.Item className="px-6 py-4 border-b border-border-light dark:border-border-dark" extra={<RightOutlined className="text-text-secondary opacity-50" />}>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Full Name</span>
                      <span className="font-medium text-text-light dark:text-text-dark text-sm">{user?.name || 'N/A'}</span>
                    </div>
                  </List.Item>
                  <List.Item className="px-6 py-4 border-b border-border-light dark:border-border-dark" extra={<RightOutlined className="text-text-secondary opacity-50" />}>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Email Address</span>
                      <span className="font-medium text-text-light dark:text-text-dark text-sm">{user?.email || 'N/A'}</span>
                    </div>
                  </List.Item>
                  <List.Item className="px-6 py-4" extra={<RightOutlined className="text-text-secondary opacity-50" />}>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Authentication Provider</span>
                      <span className="font-medium text-text-light dark:text-text-dark text-sm">Google OAuth (Firebase)</span>
                    </div>
                  </List.Item>
                </List>
              </Card>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="space-y-4">
              <Title level={5} className="uppercase tracking-widest text-text-secondary m-0 pl-2 text-sm font-bold">System Preferences</Title>
              <Card className="rounded-xl border-border-light dark:border-border-dark shadow-soft bg-chat-light dark:bg-chat-dark" bodyStyle={{ padding: 0 }}>
                <List split={true}>
                  <List.Item className="px-6 py-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      </div>
                      <span className="font-semibold text-sm text-text-light dark:text-text-dark">AI Configuration</span>
                    </div>
                    <span className="text-sm font-bold text-primary-600 capitalize">{precisionLabel}</span>
                  </List.Item>
                  <List.Item className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-secondary">
                        <span className="material-symbols-outlined text-lg">notifications_active</span>
                      </div>
                      <span className="font-semibold text-sm text-text-light dark:text-text-dark">System Alerts</span>
                    </div>
                    <Switch checked={localStorage.getItem('medai_notif_critical') !== 'false'} disabled className="bg-primary-600" />
                  </List.Item>
                </List>
              </Card>
            </div>
          </Col>
        </Row>

        <div className="pt-8 flex justify-center">
          <Button 
            danger 
            type="primary" 
            shape="round" 
            size="large" 
            icon={<LogoutOutlined />}
            className="font-bold px-12 uppercase tracking-wide bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20"
            onClick={handleLogout}
          >
            Sign Out of Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
