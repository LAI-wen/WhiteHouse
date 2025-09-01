"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Menu, Layout } from 'antd';
import { 
  HomeOutlined, 
  InfoCircleOutlined, 
  BookOutlined, 
  TeamOutlined, 
  NotificationOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';

const { Header } = Layout;

export default function Navigation() {
  const pathname = usePathname();

  const menuItems = useMemo(() => [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">首頁</Link>,
    },
    {
      key: '/intro',
      icon: <InfoCircleOutlined />,
      label: <Link href="/intro">企劃介紹</Link>,
    },
    {
      key: '/rules',
      icon: <BookOutlined />,
      label: <Link href="/rules">核心規則</Link>,
    },
    {
      key: '/players',
      icon: <TeamOutlined />,
      label: <Link href="/players">遊戲名單</Link>,
    },
    {
      key: '/bulletin',
      icon: <NotificationOutlined />,
      label: <Link href="/bulletin">告示板</Link>,
    },
    {
      key: '/qa',
      icon: <QuestionCircleOutlined />,
      label: <Link href="/qa">常見問題</Link>,
    },
  ], []);

  const selectedKeys = useMemo(() => {
    return [pathname];
  }, [pathname]);

  return (
    <Header style={{ 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
      padding: '0 2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Link href="/" style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🏛️ 白房子
        </Link>
        
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ 
            background: 'transparent',
            border: 'none',
            minWidth: '600px',
            justifyContent: 'flex-end'
          }}
        />
      </div>
    </Header>
  );
}