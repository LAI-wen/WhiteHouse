"use client";

import { Card, Typography, Space, Row, Col, Progress, Table, Tag, Alert, Divider } from 'antd';
import { 
  BookOutlined, 
  HeartFilled, 
  BulbOutlined, 
  ThunderboltOutlined, 
  QuestionCircleOutlined,
  FireOutlined,
  SafetyOutlined,
  DashboardOutlined,
  CrownOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function RulesPage() {
  const statColumns = [
    {
      title: '屬性',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span>
          {record.icon} <strong>{text}</strong>
        </span>
      ),
    },
    {
      title: '英文',
      dataIndex: 'english',
      key: 'english',
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const statData = [
    {
      key: '1',
      name: '力量',
      english: 'STR',
      description: '力量、攻擊力',
      icon: <FireOutlined style={{ color: '#ff4d4f' }} />
    },
    {
      key: '2',
      name: '體質',
      english: 'CON',
      description: '健康程度，檢查是否中毒、陷入異常狀態',
      icon: <SafetyOutlined style={{ color: '#52c41a' }} />
    },
    {
      key: '3',
      name: '敏捷',
      english: 'DEX',
      description: '判定閃避、危險反應等',
      icon: <DashboardOutlined style={{ color: '#1890ff' }} />
    },
    {
      key: '4',
      name: '外貌',
      english: 'APP',
      description: '顏值，主教會優先傳喚外貌好的孩子',
      icon: <CrownOutlined style={{ color: '#eb2f96' }} />
    },
    {
      key: '5',
      name: '智力',
      english: 'INT',
      description: '聯想、判斷、推理能力',
      icon: <EyeOutlined style={{ color: '#722ed1' }} />
    },
    {
      key: '6',
      name: '幸運',
      english: 'LUCK',
      description: '運氣',
      icon: <StarOutlined style={{ color: '#faad14' }} />
    },
  ];

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
        <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #434343 0%, #000000 100%)', color: 'white' }}>
          <Title level={1} style={{ color: 'white', margin: 0 }}>
            <BookOutlined style={{ marginRight: '1rem', color: '#fff' }} />
            核心規則
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', margin: '1rem 0 0 0' }}>
            COC 擲骰判定系統 + 白房子特色規則
          </Paragraph>
        </Card>

        {/* 重要提醒 */}
        <Alert
          message="⚠️ 重要須知"
          description="主要關卡系統以 COC 之擲骰判定方式進行與決定。San值越低，進入強控劇情可能越高！"
          type="warning"
          showIcon
        />

        {/* 主要數值系統 */}
        <Card>
          <Title level={2}>
            <HeartFilled style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
            主要數值：累積值
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <Card type="inner" style={{ border: '2px solid #ff4d4f' }}>
                <div style={{ textAlign: 'center' }}>
                  <HeartFilled style={{ fontSize: '2rem', color: '#ff4d4f', marginBottom: '1rem' }} />
                  <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>HP</Title>
                  <Progress 
                    type="circle" 
                    percent={100} 
                    format={() => '100'}
                    strokeColor="#ff4d4f"
                    size={80}
                    style={{ margin: '1rem 0' }}
                  />
                  <Paragraph style={{ margin: 0 }}>
                    <strong>生命值</strong><br/>
                    血量
                  </Paragraph>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12} lg={6}>
              <Card type="inner" style={{ border: '2px solid #722ed1' }}>
                <div style={{ textAlign: 'center' }}>
                  <BulbOutlined style={{ fontSize: '2rem', color: '#722ed1', marginBottom: '1rem' }} />
                  <Title level={3} style={{ color: '#722ed1', margin: 0 }}>SAN</Title>
                  <Progress 
                    type="circle" 
                    percent={100} 
                    format={() => '100'}
                    strokeColor="#722ed1"
                    size={80}
                    style={{ margin: '1rem 0' }}
                  />
                  <Paragraph style={{ margin: 0 }}>
                    <strong>理智值</strong><br/>
                    精神狀況，理智越低越容易被洗腦
                  </Paragraph>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12} lg={6}>
              <Card type="inner" style={{ border: '2px solid #1890ff' }}>
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: '2rem', color: '#1890ff', marginBottom: '1rem' }} />
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>AP</Title>
                  <Progress 
                    type="circle" 
                    percent={100} 
                    format={() => '10'}
                    strokeColor="#1890ff"
                    size={80}
                    style={{ margin: '1rem 0' }}
                  />
                  <Paragraph style={{ margin: 0 }}>
                    <strong>行動點</strong><br/>
                    可以強制拖離洗腦的次數，沒有方式恢復
                  </Paragraph>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12} lg={6}>
              <Card type="inner" style={{ border: '2px solid #52c41a' }}>
                <div style={{ textAlign: 'center' }}>
                  <QuestionCircleOutlined style={{ fontSize: '2rem', color: '#52c41a', marginBottom: '1rem' }} />
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>BP</Title>
                  <Progress 
                    type="circle" 
                    percent={100} 
                    format={() => '3'}
                    strokeColor="#52c41a"
                    size={80}
                    style={{ margin: '1rem 0' }}
                  />
                  <Paragraph style={{ margin: 0 }}>
                    <strong>提問點</strong><br/>
                    PC在劇情中可以約見主神的次數，沒有恢復方式
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 判定值系統 */}
        <Card>
          <Title level={2}>
            <StarOutlined style={{ color: '#faad14', marginRight: '0.5rem' }} />
            判定值系統
          </Title>
          <Paragraph>
            以下屬性用於各種 COC 擲骰判定，數值高低決定成功機率。
          </Paragraph>
          <Table 
            columns={statColumns} 
            dataSource={statData} 
            pagination={false}
            bordered
          />
        </Card>

        {/* 洗腦系統 */}
        <Card style={{ border: '2px solid #ff4d4f' }}>
          <Title level={2}>
            <BulbOutlined style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
            洗腦系統 / 懲罰機制
          </Title>
          
          <Alert
            message="危險！洗腦機制"
            description="每次違規將進行記憶混亂或人格削弱，透過San值判斷執行程度。"
            type="error"
            showIcon
            style={{ marginBottom: '1rem' }}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card type="inner" title="觸發條件">
                <ul>
                  <li>違反白屋規則</li>
                  <li>被神職人員舉報</li>
                  <li>調查員身份暴露</li>
                  <li>進行禁止行為</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card type="inner" title="洗腦後果">
                <ul>
                  <li>SAN 值降低</li>
                  <li>記憶被修改</li>
                  <li>人格被削弱</li>
                  <li>被劇情強控</li>
                </ul>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div style={{ background: '#fff2f0', padding: '1rem', borderRadius: '8px' }}>
            <Title level={4}>⚠️ San 值警告等級</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="green">SAN 80-100</Tag> <Text>理智清醒，抵抗力強</Text>
              </div>
              <div>
                <Tag color="orange">SAN 50-79</Tag> <Text>開始受到影響，偶爾混亂</Text>
              </div>
              <div>
                <Tag color="red">SAN 20-49</Tag> <Text>容易被洗腦，經常被強控</Text>
              </div>
              <div>
                <Tag color="black">SAN 0-19</Tag> <Text>完全失去自主權，成為傀儡</Text>
              </div>
            </Space>
          </div>
        </Card>

        {/* 遊戲進行方式 */}
        <Card>
          <Title level={2}>
            <BookOutlined style={{ color: '#1890ff', marginRight: '0.5rem' }} />
            遊戲進行方式
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card type="inner" title="文字劇情">
                <Paragraph>
                  使用文字劇情遊戲的形式帶劇情，劇情結束後發佈任務。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner" title="COC 擲骰">
                <Paragraph>
                  探索等相關遊戲主要採用 COC 擲骰判定的方式進行。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner" title="即時互動">
                <Paragraph>
                  Discord 平台進行，支援即時文字交流和角色扮演。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 特殊規則 */}
        <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Title level={2} style={{ color: 'white' }}>
            <StarOutlined style={{ color: 'white', marginRight: '0.5rem' }} />
            白房子特殊規則
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                <Title level={4} style={{ color: 'white' }}>日常儀式</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                  遵循白屋內的各種規則，體驗真實的邪教生活，違反將面臨懲罰。
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                <Title level={4} style={{ color: 'white' }}>地圖探索</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                  層層解鎖「白屋」內部真相，發現隱藏的秘密和線索。
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                <Title level={4} style={{ color: 'white' }}>陣營對抗</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                  調查員、神職人員、孩子們各有不同目標，形成複雜的對抗關係。
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                <Title level={4} style={{ color: 'white' }}>多線劇情</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                  每個陣營有不同的私人頻道，看待同一事件會有不同認知。
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

      </Space>
    </div>
  );
}
