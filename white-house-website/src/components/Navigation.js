"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useLayoutEffect  } from 'react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  // 【新增】用於儲存每個 tab 的位置和寬度
  const [tabPositions, setTabPositions] = useState([]);
  // 【新增】用於獲取 tab 容器的 DOM 元素
  const tabsRef = useRef(null);

  const menuItems = useMemo(() => [
    { path: '/', label: '首頁' },
    { path: '/about', label: '關於我們' },
    { path: '/treatment', label: '治療介紹' },
    { path: '/facilities', label: '環境介紹' },
    { path: '/join', label: '加入我們' },
    { path: '/resources', label: '資源中心' },
  ], []);

   // 【新增】使用 useLayoutEffect 在 DOM 渲染後立即測量元素
  useLayoutEffect(() => {
    if (tabsRef.current) {
      const positions = Array.from(tabsRef.current.children)
        // 過濾掉 slider 本身，只測量 Link (tab)
        .filter(el => el.tagName === 'A')
        .map(tab => ({
          left: tab.offsetLeft,
          width: tab.offsetWidth,
        }));
      setTabPositions(positions);
    }
  }, []); // 當 menuItems 變化時重新測量

  // 【修正】直接根據 pathname 計算，伺服器和客戶端結果一致
  const activeTab = useMemo(() => {
    const currentIndex = menuItems.findIndex(item => item.path === pathname);
    return currentIndex >= 0 ? currentIndex : 0;
  }, [pathname, menuItems]);

  // isClient state 和相關的 useEffect 已不再需要，可以刪除

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 【新增】獲取當前 active tab 的位置和寬度
  const activeTabPosition = tabPositions[activeTab];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`${styles.desktopNav} ${isSticky ? styles.sticky : ''}`}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            白屋醫教育成兒童中心
          </Link>
          
          {/* 【修改】將 ref 綁定到 tab 容器上 */}
          <div className={styles.tabContainer} ref={tabsRef}>
            {menuItems.map((item, index) => (
              <Link 
                key={item.path}
                href={item.path}
                className={`${styles.tab} ${pathname === item.path ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            ))}
            {/* 【修改】使用 transform 和精確的 px 值來定位滑塊 */}
            {activeTabPosition && (
              <div 
                className={styles.tabSlider}
                style={{
                  width: `${activeTabPosition.width}px`,
                  transform: `translateX(${activeTabPosition.left}px)`,
                }}
              />
            )}
          </div>

          <div className={styles.authButtons}>
            <Link href="/login" className={styles.loginBtn}>
              登入
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation (此部分未修改) */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileHeader}>
          <Link href="/" className={styles.mobileLogo}>
            白屋醫教育成兒童中心
          </Link>
          
          <button 
            className={`${styles.menuTrigger} ${isMenuOpen ? styles.active : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.menuBar}></span>
            <span className={styles.menuBar}></span>
            <span className={styles.menuBar}></span>
          </button>
        </div>

        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
          <div className={`${styles.menuBg} ${styles.top}`}></div>
          <div className={`${styles.menuBg} ${styles.middle}`}></div>
          <div className={`${styles.menuBg} ${styles.bottom}`}></div>
          
          <div className={styles.menuOverlay}>
            <div className={styles.menuContent}>
              {menuItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`${styles.mobileMenuItem} ${pathname === item.path ? styles.active : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className={styles.mobileAuth}>
                <Link 
                  href="/login" 
                  className={styles.mobileLoginBtn}
                  onClick={() => setIsMenuOpen(false)}
                >
                  登入
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}