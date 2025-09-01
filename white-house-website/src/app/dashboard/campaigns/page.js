'use client';

import { useState, useEffect } from 'react';
import styles from './campaigns.module.css';

export default function CampaignsPage() {
  const [user, setUser] = useState(null);
  const [campaignsData, setCampaignsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepResult, setStepResult] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadCampaignsData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadCampaignsData = async (characterId) => {
    try {
      const response = await fetch(`/api/campaigns?characterId=${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaignsData(data.data);
      } else {
        console.error('載入戰役資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCampaign = async (campaign) => {
    setCurrentCampaign(campaign);
    setShowCampaignModal(true);
    
    try {
      const response = await fetch('/api/campaigns/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: user.characterId,
          campaignId: campaign.Campaign_ID,
          action: campaign.status === 'available' ? 'start' : 'continue'
        })
      });

      const result = await response.json();
      if (result.success) {
        setCurrentStep(result.data.currentStep);
        setAvailableOptions(result.data.availableOptions);
        setSelectedOption(null);
        setStepResult(null);
      } else {
        alert('開始戰役失敗: ' + result.error);
        setShowCampaignModal(false);
      }
    } catch (error) {
      console.error('開始戰役錯誤:', error);
      alert('開始戰役時發生錯誤');
      setShowCampaignModal(false);
    }
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const submitChoice = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/campaigns/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: user.characterId,
          campaignId: currentCampaign.Campaign_ID,
          action: 'choose',
          stepId: currentStep.Step_ID,
          optionId: selectedOption
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStepResult(result.data);
        
        if (result.data.isCompleted) {
          // 戰役完成
          setTimeout(() => {
            setShowCampaignModal(false);
            loadCampaignsData(user.characterId); // 重新載入戰役列表
          }, 3000);
        } else if (result.data.nextStep) {
          // 有下一步，3秒後自動繼續
          setTimeout(() => {
            setCurrentStep(result.data.nextStep);
            setAvailableOptions(result.data.nextOptions);
            setSelectedOption(null);
            setStepResult(null);
          }, 3000);
        }
      } else {
        alert('提交失敗: ' + result.error);
      }
    } catch (error) {
      console.error('提交錯誤:', error);
      alert('提交時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCampaignModal = () => {
    setShowCampaignModal(false);
    setCurrentCampaign(null);
    setCurrentStep(null);
    setAvailableOptions([]);
    setSelectedOption(null);
    setStepResult(null);
    loadCampaignsData(user.characterId); // 重新載入列表
  };

  if (loading || !user || !campaignsData) {
    return <div className={styles.loading}>載入中...</div>;
  }

  const getCurrentCampaigns = () => {
    switch (activeTab) {
      case 'available': return campaignsData.availableCampaigns || [];
      case 'inProgress': return campaignsData.inProgressCampaigns || [];
      case 'completed': return campaignsData.completedCampaigns || [];
      default: return [];
    }
  };

  return (
    <>
      <div className={styles.campaignsPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎭 事件戰役</h1>
          <div className={styles.stats}>
            <span>總計: {campaignsData.stats.total}</span>
            <span>可參與: {campaignsData.stats.available}</span>
            <span>進行中: {campaignsData.stats.inProgress}</span>
            <span>已完成: {campaignsData.stats.completed}</span>
          </div>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
            onClick={() => setActiveTab('available')}
          >
            可參與戰役 ({campaignsData.availableCampaigns?.length || 0})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'inProgress' ? styles.active : ''}`}
            onClick={() => setActiveTab('inProgress')}
          >
            進行中戰役 ({campaignsData.inProgressCampaigns?.length || 0})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            已完成戰役 ({campaignsData.completedCampaigns?.length || 0})
          </button>
        </div>

        <div className={styles.campaignsList}>
          {getCurrentCampaigns().map(campaign => (
            <div key={campaign.Campaign_ID} className={styles.campaignCard}>
              <div className={styles.campaignInfo}>
                <h3 className={styles.campaignName}>{campaign.Campaign_Name}</h3>
                <p className={styles.campaignDescription}>{campaign.Campaign_Description}</p>
                {campaign.progress && (
                  <div className={styles.progressInfo}>
                    <span className={styles.progressText}>
                      進度: {campaign.progress.Completed_Steps?.split(',').length || 0} 步驟已完成
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.campaignActions}>
                <button 
                  className={`${styles.actionBtn} ${styles[campaign.status]}`}
                  onClick={() => startCampaign(campaign)}
                >
                  {campaign.buttonText}
                </button>
              </div>
            </div>
          ))}
          
          {getCurrentCampaigns().length === 0 && (
            <div className={styles.empty}>
              沒有{activeTab === 'available' ? '可參與' : activeTab === 'inProgress' ? '進行中' : '已完成'}的戰役
            </div>
          )}
        </div>
      </div>

      {/* 戰役遊玩彈窗 */}
      {showCampaignModal && currentCampaign && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{currentCampaign.Campaign_Name}</h2>
              <button className={styles.closeBtn} onClick={closeCampaignModal}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {stepResult ? (
                // 顯示選擇結果
                <div className={styles.stepResult}>
                  <h3>選擇結果</h3>
                  <p className={styles.chosenOption}>你選擇了：{stepResult.optionText}</p>
                  
                  {stepResult.outcomes?.length > 0 && (
                    <div className={styles.outcomes}>
                      {stepResult.outcomes.map(outcome => (
                        <p key={outcome.Outcome_ID} className={styles.outcomeText}>
                          {outcome.Outcome_Description}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {stepResult.changes?.length > 0 && (
                    <div className={styles.changes}>
                      <h4>數值變化</h4>
                      <p className={styles.changesList}>
                        {stepResult.changes.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {stepResult.isCompleted ? (
                    <div className={styles.completedMessage}>
                      <h3>🎉 戰役完成！</h3>
                      <p>恭喜你完成了這個戰役！</p>
                    </div>
                  ) : stepResult.nextStep ? (
                    <div className={styles.nextStepHint}>
                      <p>即將前往下一步驟...</p>
                    </div>
                  ) : null}
                </div>
              ) : currentStep ? (
                // 顯示當前步驟
                <div className={styles.currentStep}>
                  <h3 className={styles.stepTitle}>{currentStep.Step_Title}</h3>
                  <p className={styles.stepDescription}>{currentStep.Step_Description}</p>
                  
                  {availableOptions.length > 0 && (
                    <div className={styles.options}>
                      <h4>選擇你的行動：</h4>
                      {availableOptions.map(option => (
                        <label key={option.Option_ID} className={styles.optionLabel}>
                          <input
                            type="radio"
                            name="stepOption"
                            value={option.Option_ID}
                            checked={selectedOption === option.Option_ID}
                            onChange={() => handleOptionSelect(option.Option_ID)}
                            className={styles.optionRadio}
                          />
                          <span className={styles.optionText}>{option.Option_Text}</span>
                          {option.Requirement_Text && (
                            <span className={styles.requirementText}>{option.Requirement_Text}</span>
                          )}
                        </label>
                      ))}
                      
                      <button 
                        className={styles.submitBtn}
                        onClick={submitChoice}
                        disabled={!selectedOption || isSubmitting}
                      >
                        {isSubmitting ? '提交中...' : '確定選擇'}
                      </button>
                    </div>
                  )}
                  
                  {availableOptions.length === 0 && (
                    <div className={styles.noOptions}>
                      <p>沒有可用的選項，戰役結束。</p>
                      <button className={styles.closeBtn} onClick={closeCampaignModal}>
                        關閉
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.loading}>載入戰役中...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}