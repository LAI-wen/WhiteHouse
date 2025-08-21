"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Input, 
  Button, 
  Modal, 
  Descriptions, 
  Avatar, 
  Progress, 
  Badge,
  Empty,
  Spin,
  Alert
} from 'antd';
import { 
  TeamOutlined, 
  TrophyOutlined, 
  EyeOutlined,
  UserOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined,
  LockOutlined,
  SafetyOutlined,
  DollarOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Password } = Input;

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [privateInfo, setPrivateInfo] = useState(null);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        const players = data.data || data || [];
        setPlayers(players);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch players:', error);
        setPlayers([]);
        setLoading(false);
      });
  }, []);

  const handleShowInfo = (player) => {
    setSelected(player);
    setPrivateInfo(null);
    setPassword('');
    setError('');
    setModalVisible(true);
  };

  const handleCheck = async () => {
    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }
    
    setCheckingPassword(true);
    setError('');
    
    try {
      const res = await fetch('/api/player-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selected.id, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPrivateInfo(data.data);
      } else {
        setError(data.message || '密碼錯誤或查詢失敗');
      }
    } catch (err) {
      setError('查詢過程發生錯誤');
    } finally {
      setCheckingPassword(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#dc143c'; // 深紅色
    if (rank <= 10) return '#ffd700'; // 金色
    if (rank <= 20) return '#b8860b'; // 暗金色
    return '#696969'; // 深灰色
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#ffd700' }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#ffd700' }} />;
    if (rank === 3) return <StarOutlined style={{ color: '#ffd700' }} />;
    return <UserOutlined style={{ color: '#696969' }} />;
  };

  const getFactionTag = (score) => {
    if (score >= 80) return <Tag style={{ background: '#dc143c', color: 'white', border: 'none' }}>神職人員</Tag>;
    if (score >= 60) return <Tag style={{ background: '#b8860b', color: 'white', border: 'none' }}>調查員</Tag>;
    return <Tag style={{ background: '#2f4f4f', color: 'white', border: 'none' }}>孩子們</Tag>;
  };

  // 搜尋過濾功能
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchText.toLowerCase()) ||
    player.id.toLowerCase().includes(searchText.toLowerCase()) ||
    player.score.toString().includes(searchText)
  );

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      align: 'center',
      width: 80,
      render: (rank) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            background: getRankColor(rank),
            color: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            #{rank}
          </div>
          <div style={{ marginTop: '4px' }}>
            {getRankIcon(rank)}
          </div>
        </div>
      ),
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: '信徒姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar 
            size={48}
            style={{ 
              backgroundColor: getRankColor(record.rank),
              color: 'white',
              border: '2px solid #ffd700'
            }}
          >
            {name.charAt(0)}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '16px', color: '#000' }}>{name}</Text>
            <br />
            {getFactionTag(record.score)}
          </div>
        </div>
      ),
    },
    {
      title: '忠誠積分',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score) => (
        <div>
          <Text strong style={{ fontSize: '18px', color: '#dc143c' }}>{score}</Text>
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={{
              '0%': '#dc143c',
              '50%': '#ffd700',
              '100%': '#228b22',
            }}
            showInfo={false}
            style={{ marginTop: '6px' }}
          />
        </div>
      ),
      sorter: (a, b) => b.score - a.score,
    },
    {
      title: '信仰等級',
      dataIndex: 'score',
      key: 'level',
      align: 'center',
      render: (score) => {
        if (score >= 90) return <Tag style={{ background: 'linear-gradient(45deg, #dc143c, #8b0000)', color: 'white', border: 'none' }}>✨ 狂信者</Tag>;
        if (score >= 80) return <Tag style={{ background: 'linear-gradient(45deg, #ff4500, #dc143c)', color: 'white', border: 'none' }}>🔥 虔誠者</Tag>;
        if (score >= 70) return <Tag style={{ background: 'linear-gradient(45deg, #ffd700, #b8860b)', color: 'white', border: 'none' }}>💎 信徒</Tag>;
        if (score >= 60) return <Tag style={{ background: 'linear-gradient(45deg, #b8860b, #696969)', color: 'white', border: 'none' }}>🌟 學員</Tag>;
        return <Tag style={{ background: '#696969', color: 'white', border: 'none' }}>👶 新手</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => handleShowInfo(record)}
          style={{
            background: 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          查看檔案
        </Button>
      ),
    },
  ];

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f5f5f5 100%)',
      minHeight: '100vh',
      padding: '1rem 1rem 2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 頁面標題 */}
          <Card style={{ 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #000000 0%, #2f2f2f 100%)', 
            color: 'white',
            border: '3px solid #ffd700',
            borderRadius: '12px'
          }}>
            <Title level={1} style={{ color: 'white', margin: 0 }}>
              <TeamOutlined style={{ marginRight: '1rem', color: '#ffd700' }} />
              👥 白房子信徒名冊
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', margin: '1rem 0 0 0' }}>
              選民學院 | 忠誠度排名與個人檔案查詢
            </Paragraph>
          </Card>

          {/* 搜尋欄 */}
          <Card style={{ 
            background: 'white',
            border: '2px solid #ffd700',
            borderRadius: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '500px' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#dc143c' }} />}
                  placeholder="搜尋信徒姓名、ID 或積分..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="large"
                  style={{
                    borderRadius: '25px',
                    border: '2px solid #ffd700',
                    fontSize: '16px'
                  }}
                  allowClear
                />
              </div>
              
              {searchText && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #b8860b'
                }}>
                  <Text strong style={{ color: '#000' }}>
                    找到 {filteredPlayers.length} 位信徒
                  </Text>
                </div>
              )}
            </div>
          </Card>

          {/* 統計卡片 - 使用新配色 */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #000000 0%, #2f2f2f 100%)',
                border: '2px solid #ffd700',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: '#ffd700', margin: 0 }}>{filteredPlayers.length}</Title>
                  <Text style={{ color: 'white', fontSize: '14px' }}>總信徒數</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)',
                border: '2px solid #ffd700',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {filteredPlayers.filter(p => p.score >= 80).length}
                  </Title>
                  <Text style={{ color: 'white', fontSize: '14px' }}>神職人員</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #b8860b 0%, #8b6914 100%)',
                border: '2px solid #ffd700',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {filteredPlayers.filter(p => p.score >= 60 && p.score < 80).length}
                  </Title>
                  <Text style={{ color: 'white', fontSize: '14px' }}>調查員</Text>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ 
                background: 'linear-gradient(135deg, #2f4f4f 0%, #1c3a3a 100%)',
                border: '2px solid #ffd700',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white' }}>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {filteredPlayers.filter(p => p.score < 60).length}
                  </Title>
                  <Text style={{ color: 'white', fontSize: '14px' }}>孩子們</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 排行榜 */}
          <Card 
            title={
              <span style={{ fontSize: '1.3rem', color: '#000' }}>
                <TrophyOutlined style={{ color: '#ffd700', marginRight: '0.5rem' }} />
                🏆 忠誠度排行榜
              </span>
            }
            style={{ 
              background: 'white',
              border: '2px solid #ffd700',
              borderRadius: '12px'
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: '1rem', color: '#666' }}>正在載入信徒資料...</Paragraph>
              </div>
            ) : filteredPlayers.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredPlayers}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 筆，共 ${total} 筆信徒`,
                  style: { marginTop: '1rem' }
                }}
                scroll={{ x: 800 }}
                style={{ background: 'white' }}
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
              />
            ) : (
              <Empty 
                description={
                  <span style={{ color: '#666' }}>
                    {searchText 
                      ? `沒有找到符合 "${searchText}" 的信徒` 
                      : "暫無信徒資料"}
                  </span>
                } 
              />
            )}
          </Card>

          {/* 密碼查詢Modal */}
          <Modal
            title={
              <span style={{ color: '#000' }}>
                <LockOutlined style={{ marginRight: '0.5rem', color: '#dc143c' }} />
                信徒檔案查詢 - {selected?.name}
              </span>
            }
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setPrivateInfo(null);
              setPassword('');
              setError('');
            }}
            footer={null}
            width={650}
          >
            {selected && (
              <div>
                {!privateInfo ? (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Alert
                      message="機密檔案存取"
                      description="此為機密個人檔案，請輸入該信徒的專屬密碼方可查看詳細資料。"
                      type="warning"
                      showIcon
                    />
                    
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <Avatar 
                        size={80}
                        style={{ 
                          backgroundColor: getRankColor(selected.rank),
                          marginBottom: '1rem',
                          border: '3px solid #ffd700'
                        }}
                      >
                        {selected.name.charAt(0)}
                      </Avatar>
                      <Title level={3} style={{ color: '#000' }}>{selected.name}</Title>
                      <Text type="secondary" style={{ fontSize: '16px' }}>
                        排名: #{selected.rank} | 積分: {selected.score}
                      </Text>
                    </div>

                    <div>
                      <Text strong style={{ color: '#000' }}>請輸入密碼：</Text>
                      <Password
                        placeholder="輸入該信徒的查詢密碼"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onPressEnter={handleCheck}
                        style={{ 
                          marginTop: '0.5rem',
                          borderRadius: '6px'
                        }}
                        size="large"
                      />
                    </div>

                    {error && (
                      <Alert message={error} type="error" showIcon />
                    )}

                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        onClick={handleCheck}
                        loading={checkingPassword}
                        size="large"
                        style={{
                          background: 'linear-gradient(135deg, #dc143c 0%, #8b0000 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          height: '45px',
                          fontSize: '16px'
                        }}
                      >
                        {checkingPassword ? '驗證中...' : '確認查詢'}
                      </Button>
                    </div>
                  </Space>
                ) : (
                  <div>
                    <Alert
                      message="檔案存取成功"
                      description="已成功驗證身份，以下為該信徒的詳細檔案資料。"
                      type="success"
                      showIcon
                      style={{ marginBottom: '1.5rem' }}
                    />

                    <Descriptions 
                      title={
                        <span style={{ color: '#000' }}>
                          <UserOutlined style={{ marginRight: '0.5rem', color: '#dc143c' }} />
                          {privateInfo.name} 的個人檔案
                        </span>
                      }
                      bordered
                      column={2}
                      style={{ 
                        background: 'white',
                        borderRadius: '8px'
                      }}
                    >
                      <Descriptions.Item label="信徒ID" span={1}>
                        <Text code style={{ color: '#dc143c' }}>{privateInfo.id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="姓名" span={1}>
                        <Text strong style={{ color: '#000' }}>{privateInfo.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="忠誠積分" span={1}>
                        <Badge 
                          count={privateInfo.score} 
                          style={{ backgroundColor: '#dc143c' }}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="當前排名" span={1}>
                        <Text style={{ color: getRankColor(selected.rank), fontWeight: 'bold' }}>
                          #{selected.rank}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="白房子貨幣" span={1}>
                        <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>
                          <DollarOutlined /> {privateInfo.money || 0}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="個人道具" span={1}>
                        {privateInfo.items && privateInfo.items.length > 0 ? (
                          <div>
                            {privateInfo.items.map((item, index) => (
                              <Tag key={index} style={{ 
                                background: '#ffd700', 
                                color: '#000', 
                                border: '1px solid #b8860b',
                                margin: '2px' 
                              }}>
                                {item}
                              </Tag>
                            ))}
                          </div>
                        ) : (
                          <Text type="secondary">無道具</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="能力數值" span={2}>
                        <Text code style={{ 
                          whiteSpace: 'pre-wrap',
                          background: '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px',
                          color: '#000'
                        }}>
                          {typeof privateInfo.stats === 'object' 
                            ? JSON.stringify(privateInfo.stats, null, 2) 
                            : (privateInfo.stats || '數值未設定')}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </div>
            )}
          </Modal>

        </Space>
      </div>

      {/* 自定義樣式 */}
      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: white;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
          color: #000;
          font-weight: bold;
          border-bottom: 2px solid #ffd700;
        }
        .ant-pagination-item-active {
          border-color: #ffd700;
          background: #ffd700;
        }
        .ant-pagination-item-active a {
          color: #000;
        }
      `}</style>
    </div>
  );
}