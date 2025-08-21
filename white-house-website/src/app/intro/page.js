"use client";

import { Card, Typography, Space, Row, Col, Tag, Divider } from 'antd';
import { 
  ExclamationCircleOutlined, 
  HeartOutlined, 
  TeamOutlined, 
  EyeOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function IntroPage() {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* 頁面標題 */}
        <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)', color: 'white' }}>
          <Title level={1} style={{ color: 'white', margin: 0 }}>
            <HomeOutlined style={{ marginRight: '1rem', color: '#fff' }} />
            《白房子》企劃介紹
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', margin: '1rem 0 0 0' }}>
            DC 企劃｜陣營・懸疑・探索・劇情
          </Paragraph>
          <div style={{ marginTop: '1rem' }}>
            <Tag color="red">邪教</Tag>
            <Tag color="orange">毀三觀</Tag>
            <Tag color="purple">規則遊戲</Tag>
            <Tag color="blue">陣營推理</Tag>
            <Tag color="green">劇情探索</Tag>
            <Tag color="cyan">角色扮演</Tag>
          </div>
        </Card>

        {/* 前言概要 */}
        <Card>
          <Title level={2}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
            前言概要
          </Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', background: '#fff2f0', padding: '1rem', borderRadius: '8px', border: '1px solid #ffccc7' }}>
            自稱為<Text strong>「選民學院」</Text>，實際為真理教殘黨暗中運營的洗腦培育中心，理念繼承教主<Text strong>「林主神」</Text>的啟示，宣稱：<Text italic>「白色是淨化的起點，孩子是再造的種子。」</Text>，為逃避外界監控，轉向育成型教育中心，並遷往偏遠山區發展。
          </Paragraph>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
            孩子們長年生活在白屋中，他們必須遵守教會規則，否則視為謀反的異教徒，教會將繼續洗禮儀式（洗腦）將玩家再造。
          </Paragraph>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
            引用真實事件作為故事，創作以Discord為遊玩平台的劇情向企劃，玩家將扮演其中角色解開選民學院的真相。企劃使用文字劇情與探索等等遊戲方式引導玩家扮演角色、了解事件故事、解開秘密與結局。
          </Paragraph>
          <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            <Text type="secondary">
              <strong>背景參考：</strong> 徐少龍事件 - 真實邪教案例改編
            </Text>
          </div>
        </Card>

        {/* 核心概念 */}
        <Card>
          <Title level={2}>
            <HeartOutlined style={{ color: '#1890ff', marginRight: '0.5rem' }} />
            核心概念
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card type="inner" title="遊戲平台與更新">
                <Paragraph>Discord多人遊戲，心理驚悚敘事</Paragraph>
                <Paragraph><Text strong>每週更新</Text>任務與事件</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="世界觀設定">
                <Paragraph>30年後的世界充滿著AI與各式各樣的科技，人民的貧富差距越來越懸殊。</Paragraph>
                <Paragraph>為了追求心靈的和平，台灣暗中似乎發展出不正常的宗教信仰。</Paragraph>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Title level={3}>目標受眾</Title>
          <ul>
            <li>喜好推理、重口、黑暗敘事與心理驚悚題材的成人玩家</li>
            <li>對社會控制、宗教洗腦、極權主義具批判性興趣的玩家</li>
          </ul>
        </Card>

        {/* 陣營系統 */}
        <Card>
          <Title level={2}>
            <TeamOutlined style={{ color: '#52c41a', marginRight: '0.5rem' }} />
            陣營角色扮演
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                type="inner" 
                title={<span><UserOutlined /> 調查員 (10人)</span>}
                style={{ border: '2px solid #1890ff' }}
              >
                <Paragraph>暗中調查宗教內部實情的玩家，混雜在大人與小孩之中</Paragraph>
                <Title level={5}>主要任務：</Title>
                <ul>
                  <li>佯裝其中，不要被發現</li>
                  <li>調查邪教的所有真相</li>
                  <li>把消息傳出去</li>
                  <li>逃離這裡</li>
                </ul>
                <div style={{ background: '#e6f7ff', padding: '0.5rem', borderRadius: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ⚠️ 被神職人員告密會被洗腦
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                type="inner" 
                title={<span><ExclamationCircleOutlined /> 神職人員 (10人)</span>}
                style={{ border: '2px solid #ff4d4f' }}
              >
                <Paragraph>已遭到洗腦，執行主教任何不合理要求的人們</Paragraph>
                <Title level={5}>主要任務：</Title>
                <ul>
                  <li>找出調查員</li>
                  <li>不要讓孩子們知道外面的世界</li>
                  <li>培養出下一任主神</li>
                </ul>
                <div style={{ background: '#fff2f0', padding: '0.5rem', borderRadius: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    🔨 可進行懲戒、審訊、洗腦任務
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                type="inner" 
                title={<span><HeartOutlined /> 孩子們 (25人)</span>}
                style={{ border: '2px solid #52c41a' }}
              >
                <Paragraph>年齡在8-16之間，每人記憶可能被修改過</Paragraph>
                <Title level={5}>主要任務：</Title>
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f6ffed', borderRadius: '8px' }}>
                  <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                    只有一個⋯活下去⋯⋯
                  </Text>
                </div>
                <div style={{ background: '#f6ffed', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    😇 時常被要求執行不合理的遊戲
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 核心玩法 */}
        <Card>
          <Title level={2}>
            <EyeOutlined style={{ color: '#722ed1', marginRight: '0.5rem' }} />
            核心玩法特色
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card type="inner" title="多線劇情互動">
                <Paragraph>每個陣營有各自的私人頻道，不同玩家在看待同一件事會有不一樣的認知</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="日常儀式與規則維持">
                <Paragraph>遵循白屋內的各種規則，體驗真實的邪教生活</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="地圖探索">
                <Paragraph>層層解鎖「白屋」內部真相</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="洗腦系統/懲罰機制">
                <Paragraph>每次違規將進行記憶混亂或人格削弱（透過San值判斷）</Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 報名須知 */}
        <Card style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', border: '2px solid #ff4d4f' }}>
          <Title level={3} style={{ color: '#722ed1' }}>📝 報名相關</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            主要選擇<Tag color="red">神職人員</Tag>、<Tag color="green">兒童</Tag>兩個陣營，並單獨提出選擇詢問是否有意願成為<Tag color="blue">調查員（臥底）</Tag>身分。
          </Paragraph>
          <Paragraph style={{ fontSize: '16px' }}>
            最終調查員的選擇將會統計意願數量後以<Text strong>抽籤方式決定</Text>並個別私訊結果。
          </Paragraph>
        </Card>

      </Space>
    </div>
  );
}