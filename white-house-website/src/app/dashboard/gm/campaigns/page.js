'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './campaigns.module.css';

export default function GMCampaignsPage() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const router = useRouter();

  // 新戰役表單數據
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    allowedFactions: '',
    allowedCharacters: '',
    isAvailable: true
  });

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      if (!userData.isGM) {
        router.push('/dashboard');
        return;
      }
      setUser(userData);
      loadCampaigns();
    } catch (error) {
      console.error('Session parse error:', error);
      router.push('/login');
    }
  }, [router]);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/gm/campaigns');
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data);
      } else {
        console.error('載入戰役失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setNewCampaign({
      name: '',
      description: '',
      allowedFactions: '',
      allowedCharacters: '',
      isAvailable: true
    });
    setEditingCampaign(null);
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setNewCampaign({
      name: campaign.Campaign_Name,
      description: campaign.Campaign_Description,
      allowedFactions: campaign.Allowed_Factions,
      allowedCharacters: campaign.Allowed_Characters,
      isAvailable: campaign.Is_Available === 'TRUE'
    });
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    
    try {
      const campaignData = {
        name: newCampaign.name,
        description: newCampaign.description,
        allowedFactions: newCampaign.allowedFactions,
        allowedCharacters: newCampaign.allowedCharacters,
        isAvailable: newCampaign.isAvailable
      };

      const url = editingCampaign 
        ? `/api/gm/campaigns/${editingCampaign.Campaign_ID}` 
        : '/api/gm/campaigns';
      
      const method = editingCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        loadCampaigns();
        alert(editingCampaign ? '戰役已更新！' : '戰役已創建！');
      } else {
        alert('操作失敗: ' + result.error);
      }
    } catch (error) {
      console.error('保存戰役錯誤:', error);
      alert('保存時發生錯誤');
    }
  };

  const handleDeleteCampaign = async (campaign) => {
    if (!confirm(`確定要刪除戰役「${campaign.Campaign_Name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/gm/campaigns/${campaign.Campaign_ID}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        loadCampaigns();
        alert('戰役已刪除！');
      } else {
        alert('刪除失敗: ' + result.error);
      }
    } catch (error) {
      console.error('刪除戰役錯誤:', error);
      alert('刪除時發生錯誤');
    }
  };

  const handleToggleAvailable = async (campaign) => {
    const newAvailable = campaign.Is_Available !== 'TRUE';
    
    try {
      const response = await fetch(`/api/gm/campaigns/${campaign.Campaign_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaign.Campaign_Name,
          description: campaign.Campaign_Description,
          allowedFactions: campaign.Allowed_Factions,
          allowedCharacters: campaign.Allowed_Characters,
          isAvailable: newAvailable
        })
      });

      const result = await response.json();
      
      if (result.success) {
        loadCampaigns();
      } else {
        alert('更新失敗: ' + result.error);
      }
    } catch (error) {
      console.error('更新戰役錯誤:', error);
      alert('更新時發生錯誤');
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>載入中...</div>;
  }

  return (
    <>
      <div className={styles.campaignsPage}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>🎭 戰役管理</h1>
            <p className={styles.subtitle}>創建和管理事件戰役</p>
          </div>
          <button className={styles.createBtn} onClick={handleCreateCampaign}>
            ➕ 創建新戰役
          </button>
        </div>

        <div className={styles.campaignsList}>
          {campaigns.map(campaign => (
            <div key={campaign.Campaign_ID} className={styles.campaignCard}>
              <div className={styles.campaignHeader}>
                <div>
                  <h3 className={styles.campaignName}>{campaign.Campaign_Name}</h3>
                  <span className={`${styles.status} ${campaign.Is_Available === 'TRUE' ? styles.available : styles.unavailable}`}>
                    {campaign.Is_Available === 'TRUE' ? '✅ 可用' : '❌ 停用'}
                  </span>
                </div>
                <div className={styles.campaignActions}>
                  <button 
                    className={styles.editBtn}
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    ✏️ 編輯
                  </button>
                  <button 
                    className={styles.designBtn}
                    onClick={() => router.push(`/dashboard/gm/campaigns/${campaign.Campaign_ID}/design`)}
                  >
                    🎨 設計
                  </button>
                  <button 
                    className={styles.toggleBtn}
                    onClick={() => handleToggleAvailable(campaign)}
                  >
                    {campaign.Is_Available === 'TRUE' ? '⏸️ 停用' : '▶️ 啟用'}
                  </button>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteCampaign(campaign)}
                  >
                    🗑️ 刪除
                  </button>
                </div>
              </div>

              <div className={styles.campaignContent}>
                <p className={styles.description}>{campaign.Campaign_Description}</p>
                
                <div className={styles.restrictions}>
                  {campaign.Allowed_Factions && (
                    <div className={styles.restriction}>
                      <strong>允許陣營:</strong> {campaign.Allowed_Factions}
                    </div>
                  )}
                  {campaign.Allowed_Characters && (
                    <div className={styles.restriction}>
                      <strong>允許角色:</strong> {campaign.Allowed_Characters}
                    </div>
                  )}
                </div>

                <div className={styles.stats}>
                  <span className={styles.stat}>步驟: {campaign.stepCount || 0}</span>
                  <span className={styles.stat}>選項: {campaign.optionCount || 0}</span>
                  <span className={styles.stat}>玩家: {campaign.playerCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
          
          {campaigns.length === 0 && (
            <div className={styles.empty}>
              <p>還沒有任何戰役</p>
              <button className={styles.createBtn} onClick={handleCreateCampaign}>
                創建第一個戰役
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 創建/編輯戰役彈窗 */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCampaign ? '編輯戰役' : '創建新戰役'}</h2>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSaveCampaign} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>戰役名稱 *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>戰役描述 *</label>
                <textarea
                  className={styles.textarea}
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>允許陣營 (用逗號分隔)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newCampaign.allowedFactions}
                  onChange={(e) => setNewCampaign({...newCampaign, allowedFactions: e.target.value})}
                  placeholder="學生會,調查社,神職人員"
                />
                <small className={styles.hint}>留空表示所有陣營都可參與</small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>允許角色 (用逗號分隔)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newCampaign.allowedCharacters}
                  onChange={(e) => setNewCampaign({...newCampaign, allowedCharacters: e.target.value})}
                  placeholder="P001,P002,P003"
                />
                <small className={styles.hint}>留空表示所有角色都可參與</small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newCampaign.isAvailable}
                    onChange={(e) => setNewCampaign({...newCampaign, isAvailable: e.target.checked})}
                  />
                  立即發布 (玩家可見)
                </label>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingCampaign ? '更新戰役' : '創建戰役'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}