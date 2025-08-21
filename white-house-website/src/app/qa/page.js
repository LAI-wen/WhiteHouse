"use client";

import { useState, useEffect } from 'react';
import { Input, Card, Typography, Space, Collapse, Button, Empty } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function QAPage() {
  const [qaList, setQAList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQA, setFilteredQA] = useState([]);

  useEffect(() => {
    fetch('/api/qa')
      .then(res => res.json())
      .then(data => {
        const qa = data.data || data || [];
        setQAList(qa);
        setFilteredQA(qa);
      })
      .catch(error => {
        console.error('Failed to fetch QA:', error);
        setQAList([]);
        setFilteredQA([]);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQA(qaList);
    } else {
      const filtered = qaList.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQA(filtered);
    }
  }, [searchTerm, qaList]);

  const collapseItems = filteredQA.map((item) => ({
    key: item.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <QuestionCircleOutlined style={{ color: '#1890ff' }} />
        <span>{item.question}</span>
      </div>
    ),
    children: (
      <Paragraph style={{ margin: 0, paddingLeft: '24px' }}>
        {item.answer}
      </Paragraph>
    ),
  }));

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={1} style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <QuestionCircleOutlined style={{ marginRight: '0.5rem', color: '#1890ff' }} />
            常見問題
          </Title>
          <Paragraph style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
            快速找到您需要的答案
          </Paragraph>
        </Card>

        <Card>
          <Input
            size="large"
            placeholder="搜尋問題或答案..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
        </Card>

        <Card>
          {filteredQA.length === 0 ? (
            <Empty
              description={searchTerm ? '沒有找到相關問題' : '載入中...'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Collapse 
              items={collapseItems}
              size="large"
              ghost
              expandIconPosition="end"
            />
          )}
        </Card>

        <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Title level={3} style={{ color: 'white' }}>還有其他問題？</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            如果您的問題不在上述列表中，請聯繫我們的客服團隊。
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            icon={<CustomerServiceOutlined />}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white'
            }}
          >
            聯繫客服
          </Button>
        </Card>
      </Space>
    </div>
  );
}