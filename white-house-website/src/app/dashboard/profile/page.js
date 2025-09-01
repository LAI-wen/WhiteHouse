'use client';

import { useState, useEffect } from 'react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadProfileData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadProfileData = async (characterId) => {
    try {
      const response = await fetch(`/api/dashboard/profile?characterId=${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.data);
      } else {
        console.error('載入角色資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !profileData) {
    return <div className={styles.loading}>載入中...</div>;
  }

  return (
    <>
      <h1 className={styles.title}>個人檔案</h1>
      
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {profileData.characterName.charAt(0)}
            </div>
            <h2 className={styles.characterName}>{profileData.characterName}</h2>
            <div className={styles.factionBadges}>
              <span className={styles.publicFaction}>{profileData.publicFaction}</span>
              {profileData.trueFaction !== profileData.publicFaction && (
                <span className={styles.trueFaction}>({profileData.trueFaction})</span>
              )}
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3 className={styles.cardTitle}>基礎數值</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>HP</span>
                <div className={styles.statBar}>
                  <div 
                    className={styles.statFill}
                    style={{ 
                      width: `${(profileData.hp / profileData.maxHp) * 100}%`,
                      backgroundColor: '#e74c3c'
                    }}
                  />
                  <span className={styles.statText}>{profileData.hp}/{profileData.maxHp}</span>
                </div>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>SAN</span>
                <div className={styles.statBar}>
                  <div 
                    className={styles.statFill}
                    style={{ 
                      width: `${(profileData.san / profileData.maxSan) * 100}%`,
                      backgroundColor: '#3498db'
                    }}
                  />
                  <span className={styles.statText}>{profileData.san}/{profileData.maxSan}</span>
                </div>
              </div>
              <div className={styles.pointsRow}>
                <div className={styles.point}>
                  <span className={styles.pointLabel}>AP</span>
                  <span className={styles.pointValue}>{profileData.ap}</span>
                </div>
                <div className={styles.point}>
                  <span className={styles.pointLabel}>BP</span>
                  <span className={styles.pointValue}>{profileData.bp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.attributesCard}>
            <h3 className={styles.cardTitle}>屬性值</h3>
            <div className={styles.attributesGrid}>
              {Object.entries(profileData.stats).map(([attr, value]) => (
                <div key={attr} className={styles.attribute}>
                  <span className={styles.attrName}>{attr}</span>
                  <span className={styles.attrValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {(profileData.goodBoyPoints > 0 || profileData.performancePoints > 0) && (
            <div className={styles.specialCard}>
              <h3 className={styles.cardTitle}>陣營點數</h3>
              <div className={styles.specialPoints}>
                {profileData.goodBoyPoints > 0 && (
                  <div className={styles.specialPoint}>
                    <span className={styles.specialLabel}>好寶寶點數</span>
                    <span className={styles.specialValue}>{profileData.goodBoyPoints}</span>
                  </div>
                )}
                {profileData.performancePoints > 0 && (
                  <div className={styles.specialPoint}>
                    <span className={styles.specialLabel}>績效點數</span>
                    <span className={styles.specialValue}>{profileData.performancePoints}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.storyCard}>
            <h3 className={styles.cardTitle}>角色背景</h3>
            <p className={styles.storyText}>{profileData.backgroundStory}</p>
          </div>

          {profileData.personalNotes && (
            <div className={styles.notesCard}>
              <h3 className={styles.cardTitle}>個人筆記</h3>
              <p className={styles.notesText}>{profileData.personalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}