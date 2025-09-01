"use client";

import Link from "next/link";
import { Card, Typography, Space, Row, Col, Button, Tag } from 'antd';
import { 
  HomeOutlined,
  InfoCircleOutlined,
  BookOutlined,
  TeamOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '4rem', 
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            🏛️ 白房子
          </Title>
          
          <Title level={2} style={{ 
            color: '#f0f0f0', 
            fontWeight: 300,
            marginBottom: '2rem'
          }}>
            《White House》DC 企劃
          </Title>

          <div style={{ marginBottom: '2rem' }}>
            <Tag color="red" style={{ fontSize: '14px', padding: '4px 12px' }}>陣營</Tag>
            <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>懸疑</Tag>
            <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>探索</Tag>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>劇情</Tag>
          </div>

          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '18px', 
            lineHeight: '1.8',
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            自稱為「選民學院」，實際為真理教殘黨暗中運營的洗腦培育中心。
            <br />
            <Text italic style={{ color: 'rgba(255,255,255,0.7)' }}>
              「白色是淨化的起點，孩子是再造的種子。」
            </Text>
          </Paragraph>

          <Button 
            type="primary" 
            size="large" 
            icon={<EyeOutlined />}
            style={{ 
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              border: 'none',
              height: '50px',
              fontSize: '16px',
              borderRadius: '25px',
              padding: '0 30px'
            }}
          >
            <Link href="/intro" style={{ color: 'white', textDecoration: 'none' }}>
              進入白房子
            </Link>
          </Button>
        </div>

        {/* Overlay Pattern */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1
        }} />
      </div>

      {/* Main Content */}
      <div style={{ 
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Navigation Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Link href="/intro" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                  border: 'none',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <InfoCircleOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>企劃介紹</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      了解白房子的世界觀與背景
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Link href="/rules" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)',
                  border: 'none',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <BookOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>核心規則</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      COC 擲骰系統與洗腦機制
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Link href="/players" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <TeamOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>遊戲名單</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      玩家排名與詳細資料查詢
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Link href="/bulletin" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                  border: 'none',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <NotificationOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>告示板</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      最新任務與重要公告
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Link href="/qa" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                  border: 'none',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <QuestionCircleOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>常見問題</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      遊戲相關疑問解答
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Card hoverable style={{ 
                  background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
                  border: '2px solid #fff',
                  height: '180px'
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <EyeOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Title level={3} style={{ color: 'white', margin: '0 0 0.5rem 0' }}>玩家登入</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                      進入個人儀表板系統
                    </Paragraph>
                  </div>
                </Card>
              </Link>
            </Col>
          </Row>

          {/* Warning Section */}
          <Card style={{ 
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            border: '2px solid #ff4d4f',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem' }} />
              <Title level={2} style={{ color: 'white' }}>⚠️ 重要提醒</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                本企劃包含心理驚悚、邪教洗腦、重口味等成人內容。
                <br />
                適合年滿 18 歲且心理承受能力良好的玩家參與。
              </Paragraph>
              <div style={{ marginTop: '1rem' }}>
                <Tag color="black" style={{ fontSize: '12px' }}>18+ 限定</Tag>
                <Tag color="red" style={{ fontSize: '12px' }}>心理驚悚</Tag>
                <Tag color="orange" style={{ fontSize: '12px' }}>重口味</Tag>
                <Tag color="purple" style={{ fontSize: '12px' }}>邪教題材</Tag>
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <Card>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <HeartOutlined style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
              企劃統計
            </Title>
            <Row gutter={[24, 24]} style={{ textAlign: 'center' }}>
              <Col xs={12} md={6}>
                <div>
                  <Title level={1} style={{ color: '#1890ff', margin: 0 }}>45</Title>
                  <Text type="secondary">總玩家數</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Title level={1} style={{ color: '#52c41a', margin: 0 }}>10</Title>
                  <Text type="secondary">調查員</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Title level={1} style={{ color: '#ff4d4f', margin: 0 }}>10</Title>
                  <Text type="secondary">神職人員</Text>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Title level={1} style={{ color: '#faad14', margin: 0 }}>25</Title>
                  <Text type="secondary">孩子們</Text>
                </div>
              </Col>
            </Row>
          </Card>

        </Space>
      </div>

      {/* Footer */}
      <div style={{ 
        background: '#000',
        color: 'rgba(255,255,255,0.6)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Built with Next.js + Ant Design + Google Sheets API
          <br />
          《白房子》DC 企劃 © 2025
        </Paragraph>
      </div>
    </div>
  );
}
