"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  created_date: string;
  is_active: string;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedNews, setSelectedNews] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 獲取最新消息
  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnnouncements(data.data.slice(0, 2)); // 只取前兩條
        }
      })
      .catch(err => console.error('Error fetching announcements:', err));
  }, []);

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 1); // 目前只有一張圖
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 處理閱讀全文點擊
  const handleReadMore = (announcement: Announcement) => {
    setSelectedNews(announcement);
    setIsModalOpen(true);
  };

  // 關閉彈出視窗
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section - 標題/口號區塊 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>白屋醫教育成兒童中心</h1>
          <p className={styles.heroSlogan}>「陽光可將一切疾病退去。」</p>
          <Link href="/about" className={styles.ctaButton}>
            了解更多
          </Link>
        </div>
      </section>

      {/* 形象輪播區塊 */}
      <section className={styles.carousel}>
        <div className={styles.carouselContainer}>
          <div 
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            <div className={styles.slide}>
              <Image
                src="/promotional-image.jpg" 
                alt="白屋療癒環境"
                width={1200}
                height={600}
                className={styles.carouselImage}
                priority
              />
              <div className={styles.slideOverlay}>
                <h3>純淨療癒環境</h3>
                <p>為每一位孩子提供最安全的成長空間</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最新消息區塊 */}
      <section className={styles.news}>
        <div className={styles.newsContainer}>
          <h2 className={styles.sectionTitle}>最新消息</h2>
          <div className={styles.newsGrid}>
            {announcements.map((announcement, index) => (
              <article key={announcement.id} className={styles.newsCard}>
                <div className={styles.newsHeader}>
                  <span className={styles.newsCategory}>{announcement.author}</span>
                  <time className={styles.newsDate}>{announcement.created_date}</time>
                </div>
                <h3 className={styles.newsTitle}>{announcement.title}</h3>
                <p className={styles.newsExcerpt}>
                  {announcement.content.substring(0, 120)}...
                </p>
                <button 
                  onClick={() => handleReadMore(announcement)}
                  className={styles.readMore}
                >
                  閱讀全文 →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 導覽區塊 */}
      <section className={styles.navigation}>
        <div className={styles.navContainer}>
          <h2 className={styles.sectionTitle}>服務項目</h2>
          <div className={styles.navGrid}>
            <Link href="/about" className={styles.navCard}>
              <h3>關於我們</h3>
              <p>了解白屋的歷史與使命</p>
            </Link>
            <Link href="/treatment" className={styles.navCard}>
              <h3>治療介紹</h3>
              <p>專業的療癒方案</p>
            </Link>
            <Link href="/facilities" className={styles.navCard}>
              <h3>環境介紹</h3>
              <p>安全舒適的療癒空間</p>
            </Link>
            <Link href="/join" className={styles.navCard}>
              <h3>加入我們</h3>
              <p>成為白屋大家庭的一員</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 頁尾 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.disclaimer}>
            <p>本網站為虛構企劃《白房子》之官方網站，所有內容均為創作，請勿與現實人物、團體、事件產生連結。</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/qa">常見問題</Link>
            <Link href="/contact">聯絡我們</Link>
            <Link href="/privacy">隱私政策</Link>
          </div>
          <div className={styles.copyright}>
            <p>© 2024 《白房子》企劃版權所有</p>
          </div>
        </div>
      </footer>

      {/* 彈出視窗 */}
      {isModalOpen && selectedNews && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <div className={styles.modalHeader}>
              <div className={styles.modalCategory}>{selectedNews.author}</div>
              <time className={styles.modalDate}>{selectedNews.created_date}</time>
            </div>
            <h2 className={styles.modalTitle}>{selectedNews.title}</h2>
            <div className={styles.modalBody}>
              <p>{selectedNews.content}</p>
              {selectedNews.id === 'A002' && (
                <div className={styles.additionalContent}>
                  <h3>社區安全守則</h3>
                  <ul>
                    <li>如發現任何可疑人士在機構周邊徘徊，請立即通報安全部門</li>
                    <li>嚴禁與外界人員討論機構內部事務</li>
                    <li>所有訪客必須經過嚴格身份驗證才能進入</li>
                    <li>定期檢查孩子們是否有異常行為或言論</li>
                    <li>維護白屋純淨環境是每個人的責任</li>
                  </ul>
                  <p className={styles.reportInfo}>
                    <strong>舉報專線：</strong> 24小時守護熱線 0800-WHITE-HOUSE
                    <br />
                    <strong>緊急聯絡：</strong> security@whitehouse-care.org
                  </p>
                </div>
              )}
              {selectedNews.id === 'A001' && (
                <div className={styles.additionalContent}>
                  <h3>畢業學員去向</h3>
                  <p>本次畢業的15位學員將前往以下地點繼續他們的「深造」：</p>
                  <ul>
                    <li>XX集團海外研發中心 - 5名學員</li>
                    <li>國際醫療援助組織 - 4名學員</li>
                    <li>跨國教育機構 - 3名學員</li>
                    <li>慈善基金會分部 - 3名學員</li>
                  </ul>
                  <p>這些優秀的孩子們將在各自的崗位上發光發熱，為世界帶來正面影響。我們相信，白屋的教育理念將透過他們傳播到世界各地。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
