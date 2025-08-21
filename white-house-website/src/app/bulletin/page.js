"use client";

import { useState, useEffect } from 'react';
import { Card, Typography, Space, Row, Col, Tag, Divider, Timeline, Badge, Empty, Spin } from 'antd';
import { 
  NotificationOutlined, 
  CalendarOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function BulletinPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bulletin')
      .then(res => res.json())
      .then(data => {
        const items = data.data || data || [];
        setItems(items);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch bulletin:', error);
        setItems([]);
        setLoading(false);
      });
  }, []);

  const quests = items.filter(i => i.type === 'quest');
  const announcements = items.filter(i => i.type === 'announcement');

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const getQuestIcon = (index) => {
    const icons = [
      <FireOutlined style={{ color: '#ff4d4f' }} />,
      <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      <ClockCircleOutlined style={{ color: '#1890ff' }} />
    ];
    return icons[index % icons.length];
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 頁面標題 */}
          <Card style={{ 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #434343 0%, #000000 100%)', 
            color: 'white',
            border: '2px solid #ff4d4f'
          }}>
            <Title level={1} style={{ color: 'white', margin: 0 }}>
              <NotificationOutlined style={{ marginRight: '1rem', color: '#ff4d4f' }} />
              📢 白房子告示板
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', margin: '1rem 0 0 0' }}>
              最新任務與重要公告 | 主神的指示與啟示
            </Paragraph>
          </Card>

          {/* 統計區塊 */}
          <Row gutter={[24, 24]}>
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                border: 'none',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>{quests.length}</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>進行中任務</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)',
                border: 'none',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>{announcements.length}</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>重要公告</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>45</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>參與信徒</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                border: 'none',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>100%</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>忠誠度</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* 任務區塊 */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span style={{ fontSize: '1.2rem' }}>
                    <FireOutlined style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
                    🎯 主神指派任務
                  </span>
                }
                style={{ 
                  background: 'linear-gradient(135deg, #fff7f7 0%, #fff2f0 100%)',
                  border: '2px solid #ff4d4f',
                  height: '500px'
                }}
                bodyStyle={{ padding: '1rem', height: '420px', overflowY: 'auto' }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spin size="large" />
                    <Paragraph style={{ marginTop: '1rem' }}>正在接收主神指示...</Paragraph>
                  </div>
                ) : quests.length > 0 ? (
                  <Timeline mode="left">
                    {quests.map((quest, index) => (
                      <Timeline.Item
                        key={quest.id}
                        dot={<Badge count={index + 1} style={{ backgroundColor: '#ff4d4f' }}>{getQuestIcon(index)}</Badge>}
                        color="#ff4d4f"
                      >
                        <Card 
                          size="small" 
                          style={{ 
                            marginBottom: '1rem',
                            border: '1px solid #ffccc7'
                          }}
                        >
                          <div style={{ marginBottom: '0.5rem' }}>
                            <Tag color="red">緊急任務</Tag>
                            <Text type="secondary">
                              <CalendarOutlined style={{ marginRight: '0.25rem' }} />
                              {formatDate(quest.date)}
                            </Text>
                          </div>
                          <Title level={5} style={{ margin: '0.5rem 0', color: '#722ed1' }}>
                            {quest.title}
                          </Title>
                          <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                            {quest.content}
                          </Paragraph>
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    description="暫無任務指派"
                    image="/api/placeholder/100/100"
                  />
                )}
              </Card>
            </Col>

            {/* 公告區塊 */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span style={{ fontSize: '1.2rem' }}>
                    <ExclamationCircleOutlined style={{ color: '#722ed1', marginRight: '0.5rem' }} />
                    📋 重要公告事項
                  </span>
                }
                style={{ 
                  background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                  border: '2px solid #722ed1',
                  height: '500px'
                }}
                bodyStyle={{ padding: '1rem', height: '420px', overflowY: 'auto' }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spin size="large" />
                    <Paragraph style={{ marginTop: '1rem' }}>正在載入公告...</Paragraph>
                  </div>
                ) : announcements.length > 0 ? (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {announcements.map((announcement, index) => (
                      <Card 
                        key={announcement.id}
                        size="small"
                        style={{ 
                          border: '1px solid #d3adf7',
                          background: index % 2 === 0 ? '#fafafa' : 'white'
                        }}
                      >
                        <div style={{ marginBottom: '0.5rem' }}>
                          <Tag color="purple">重要通知</Tag>
                          <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: '0.25rem' }} />
                            {formatDate(announcement.date)}
                          </Text>
                        </div>
                        <Title level={5} style={{ margin: '0.5rem 0', color: '#722ed1' }}>
                          {announcement.title}
                        </Title>
                        <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                          {announcement.content}
                        </Paragraph>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty 
                    description="暫無重要公告"
                    image="/api/placeholder/100/100"
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* 底部警告 */}
          <Card style={{ 
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            border: '2px solid #ff4d4f',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }} />
              <Title level={3} style={{ color: 'white' }}>⚠️ 重要提醒</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                所有任務與公告均來自主神林導師的直接指示。
                <br />
                違抗者將接受淨化洗腦，直至完全順從為止。
              </Paragraph>
              <div style={{ marginTop: '1rem' }}>
                <Tag color="black" style={{ fontSize: '12px' }}>絕對服從</Tag>
                <Tag color="red" style={{ fontSize: '12px' }}>無條件執行</Tag>
                <Tag color="orange" style={{ fontSize: '12px' }}>違者洗腦</Tag>
              </div>
            </div>
          </Card>

        </Space>
      </div>
    </div>
  );
}