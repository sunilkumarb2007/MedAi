import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Switch, List, Tag, Radio } from 'antd';
import { CheckCircleFilled, CheckCircleOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function Settings() {
  const [model, setModel] = useState(localStorage.getItem('medai_model_version') || 'v2');
  const [precision, setPrecision] = useState(localStorage.getItem('medai_precision') || 'standard');
  const [notifCritical, setNotifCritical] = useState(localStorage.getItem('medai_notif_critical') !== 'false');
  const [notifBatch, setNotifBatch] = useState(localStorage.getItem('medai_notif_batch') === 'true');
  
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [apiPing, setApiPing] = useState(0);

  // Poll backend for real status
  useEffect(() => {
    let interval;
    const checkApi = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "https://medai-ve79.onrender.com";
      const start = Date.now();
      try {
        const res = await fetch(`${API_URL}/`, { cache: "no-store", method: "GET" });
        if (res.ok) {
          setApiStatus('Live');
          setApiPing(Date.now() - start);
        } else {
          setApiStatus('Error');
          setApiPing(0);
        }
      } catch (err) {
        setApiStatus('Disconnected');
        setApiPing(0);
      }
    };
    checkApi();
    interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleModelSelect = (m) => {
    setModel(m);
    localStorage.setItem('medai_model_version', m);
    window.dispatchEvent(new Event('model_changed'));
  };

  const handlePrecisionChange = (e) => {
    setPrecision(e.target.value);
    localStorage.setItem('medai_precision', e.target.value);
  };

  const handleNotifCritical = (v) => {
    setNotifCritical(v);
    localStorage.setItem('medai_notif_critical', v);
  };

  const handleNotifBatch = (v) => {
    setNotifBatch(v);
    localStorage.setItem('medai_notif_batch', v);
  };

  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark transition-colors duration-300 overflow-y-auto h-full px-8 md:px-16 lg:px-24">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-16 pt-12">
          <Title level={1} className="text-text-light dark:text-text-dark m-0 text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Settings</Title>
          <Text className="text-xl text-text-secondary max-w-2xl leading-relaxed block">
            Configure your clinical workspace. Manage intelligence models, security protocols, and system integration.
          </Text>
        </div>

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={16} className="space-y-12">
            
            <div className="space-y-6">
              <Title level={3} className="font-bold text-text-light dark:text-text-dark m-0">Intelligence Model</Title>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  hoverable 
                  onClick={() => handleModelSelect('v1')}
                  className={`rounded-xl border-2 cursor-pointer transition-all bg-chat-light dark:bg-chat-dark ${model === 'v1' ? 'border-primary-600 shadow-soft relative' : 'border-border-light dark:border-border-dark'}`}
                  bodyStyle={{ padding: '24px' }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${model === 'v1' ? 'text-primary-600' : 'text-text-secondary'}`}>Standard</span>
                    {model === 'v1' ? <CheckCircleFilled className="text-primary-600" /> : <CheckCircleOutlined className="text-text-secondary opacity-50" />}
                  </div>
                  <Title level={4} className="font-bold mb-1 m-0 text-text-light dark:text-text-dark">MediAI v1</Title>
                  <Text className="text-sm leading-snug text-text-secondary">Fast, efficient baseline diagnostics.</Text>
                </Card>

                <Card 
                  hoverable 
                  onClick={() => handleModelSelect('v2')}
                  className={`rounded-xl border-2 cursor-pointer transition-all bg-chat-light dark:bg-chat-dark ${model === 'v2' ? 'border-primary-600 shadow-soft relative' : 'border-border-light dark:border-border-dark'}`}
                  bodyStyle={{ padding: '24px' }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${model === 'v2' ? 'text-primary-600' : 'text-text-secondary'}`}>Enhanced</span>
                    {model === 'v2' ? <CheckCircleFilled className="text-primary-600" /> : <CheckCircleOutlined className="text-text-secondary opacity-50" />}
                  </div>
                  <Title level={4} className="font-bold mb-1 m-0 text-text-light dark:text-text-dark">MediAI v2</Title>
                  <Text className="text-sm leading-snug text-text-secondary">Balanced accuracy for complex cases.</Text>
                </Card>

                <Card 
                  hoverable 
                  onClick={() => handleModelSelect('v3')}
                  className={`rounded-xl border-2 cursor-pointer transition-all bg-chat-light dark:bg-chat-dark overflow-hidden ${model === 'v3' ? 'border-primary-600 shadow-soft relative' : 'border-border-light dark:border-border-dark'}`} 
                  bodyStyle={{ padding: '24px' }}>
                  {model === 'v3' && (
                    <div className="absolute top-0 right-0 bg-primary-600/10 px-3 py-1 rounded-bl-lg">
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Active</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${model === 'v3' ? 'text-primary-600' : 'text-text-secondary'}`}>Advanced</span>
                    {model === 'v3' ? <CheckCircleFilled className="text-primary-600" /> : <CheckCircleOutlined className="text-text-secondary opacity-50" />}
                  </div>
                  <Title level={4} className="font-bold mb-1 m-0 text-text-light dark:text-text-dark">MediAI v3 Pro</Title>
                  <Text className="text-sm leading-snug text-text-secondary">Full multimodal analysis &amp; reasoning.</Text>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Title level={3} className="font-bold text-text-light dark:text-text-dark m-0">AI Precision Tuning</Title>
              <Card className="rounded-xl border border-border-light dark:border-border-dark shadow-soft bg-chat-light dark:bg-chat-dark" bodyStyle={{ padding: '24px' }}>
                <Paragraph className="text-sm text-text-secondary mb-6">
                  Adjust how strictly the AI should conform to established medical guidelines versus exploratory diagnostic reasoning.
                </Paragraph>
                <Radio.Group value={precision} onChange={handlePrecisionChange} className="w-full flex">
                  <Radio.Button value="exploratory" className="flex-1 text-center font-medium">Exploratory</Radio.Button>
                  <Radio.Button value="standard" className="flex-1 text-center font-medium">Standard</Radio.Button>
                  <Radio.Button value="strict" className="flex-1 text-center font-medium">Strict Clinical</Radio.Button>
                </Radio.Group>
              </Card>
            </div>

            <div className="space-y-6 pb-24">
              <Title level={3} className="font-bold text-text-light dark:text-text-dark m-0">Notifications</Title>
              <Card className="rounded-xl border border-border-light dark:border-border-dark shadow-soft bg-chat-light dark:bg-chat-dark" bodyStyle={{ padding: 0 }}>
                <List split={true}>
                  <List.Item className="px-6 py-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <span className="material-symbols-outlined">clinical_notes</span>
                      </div>
                      <div>
                        <p className="font-semibold text-text-light dark:text-text-dark m-0 leading-tight">Critical Findings</p>
                        <p className="text-sm text-text-secondary m-0 leading-tight">Immediate alerts for life-threatening pathologies.</p>
                      </div>
                    </div>
                    <Switch checked={notifCritical} onChange={handleNotifCritical} className={notifCritical ? 'bg-primary-600' : ''} />
                  </List.Item>
                  <List.Item className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-secondary">
                        <span className="material-symbols-outlined">analytics</span>
                      </div>
                      <div>
                        <p className="font-semibold text-text-light dark:text-text-dark m-0 leading-tight">Batch Analysis Reports</p>
                        <p className="text-sm text-text-secondary m-0 leading-tight">Daily summary of non-urgent processed records.</p>
                      </div>
                    </div>
                    <Switch checked={notifBatch} onChange={handleNotifBatch} className={notifBatch ? 'bg-primary-600' : ''} />
                  </List.Item>
                </List>
              </Card>
            </div>

          </Col>

          <Col xs={24} lg={8} className="space-y-8">
            <Card className={`rounded-xl border-none border-l-[6px] ${apiStatus === 'Live' ? 'border-emerald-500' : 'border-red-500'} shadow-soft bg-chat-light dark:bg-chat-dark p-6`} bodyStyle={{ padding: 0 }}>
              <Title level={5} className="uppercase tracking-widest text-text-secondary text-xs font-bold mb-6 m-0">System Status</Title>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Text className="text-sm font-medium text-text-secondary">API Endpoint</Text>
                  <span className={`flex items-center gap-2 font-bold text-sm ${apiStatus === 'Live' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${apiStatus === 'Live' ? 'bg-emerald-500' : 'bg-red-500'}`}></span> {apiStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-sm font-medium text-text-secondary">Latent Speed</Text>
                  <Text className="font-bold text-sm text-text-light dark:text-text-dark">{apiStatus === 'Live' ? `${apiPing}ms` : '---'}</Text>
                </div>
              </div>
            </Card>

            <div className="p-8 bg-primary-600 text-white rounded-xl relative overflow-hidden shadow-soft">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">lightbulb</span>
              <Title level={4} className="font-bold mb-2 text-white m-0">Editor's Tip</Title>
              <Paragraph className="text-sm text-white/80 leading-relaxed m-0 mt-2">
                Choosing "Strict Clinical" precision forces the AI to heavily favor standardized medical textbooks and exclude edge-case differential diagnoses.
              </Paragraph>
            </div>

          </Col>
        </Row>
      </div>
    </div>
  );
}
