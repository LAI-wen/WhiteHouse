'use client';

import { useState, useEffect } from 'react';
import styles from './events.module.css';

export default function EventsPage() {
  const [user, setUser] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submittingEvent, setSubmittingEvent] = useState(null);
  const [showResult, setShowResult] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadEventsData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadEventsData = async (characterId) => {
    try {
      const response = await fetch(`/api/dashboard/events?characterId=${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setEventsData(data.data);
      } else {
        console.error('載入事件資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (eventId, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [eventId]: optionId
    }));
  };

  const handleSubmitChoice = async (stepId) => {
    const optionId = selectedOptions[stepId];
    if (!optionId) return;

    setSubmittingEvent(stepId);
    
    try {
      const response = await fetch('/api/dashboard/events/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: user.characterId,
          stepId,
          optionId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowResult(result.data);
        // 重新載入事件資料
        await loadEventsData(user.characterId);
        // 清除已選擇的選項
        setSelectedOptions(prev => {
          const newOptions = { ...prev };
          delete newOptions[stepId];
          return newOptions;
        });
      } else {
        alert('提交失敗: ' + result.error);
      }
    } catch (error) {
      console.error('提交錯誤:', error);
      alert('提交時發生錯誤');
    } finally {
      setSubmittingEvent(null);
    }
  };

  const closeResultModal = () => {
    setShowResult(null);
    // 重新載入用戶session以更新數值
    const session = localStorage.getItem('userSession');
    if (session) {
      const userData = JSON.parse(session);
      // 這裡可以重新獲取用戶數據，但為了簡單起見先保持原樣
      // 實際應用中應該更新localStorage中的用戶數據
    }
  };

  if (loading || !user || !eventsData) {
    return <div className={styles.loading}>載入中...</div>;
  }

  const renderStepCard = (step, isCompleted = false) => {
    const selectedOption = selectedOptions[step.Step_ID];
    const isSubmitting = submittingEvent === step.Step_ID;

    return (
      <div key={step.Step_ID} className={`${styles.eventCard} ${isCompleted ? styles.completedEventCard : ''}`}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{step.Step_Title}</h3>
          <p className={styles.eventDescription}>{step.Step_Description}</p>
          <div className={styles.eventMeta}>
            <span className={styles.eventType}>{step.Event_Name}</span>
            <span className={styles.eventDate}>
              創建: {new Date(step.Created_Date).toLocaleDateString('zh-TW')}
            </span>
          </div>
        </div>

        {!isCompleted && step.options && (
          <>
            <div className={styles.optionsSection}>
              <h4 className={styles.optionsTitle}>選擇你的行動：</h4>
              <div className={styles.optionsList}>
                {step.options.map(option => (
                  <div 
                    key={option.Option_ID}
                    className={`${styles.optionCard} ${selectedOption === option.Option_ID ? styles.selectedOption : ''}`}
                    onClick={() => handleOptionSelect(step.Step_ID, option.Option_ID)}
                  >
                    <p className={styles.optionText}>{option.Option_Text}</p>
                    {option.Requirement_Text && (
                      <p className={styles.optionDescription}>
                        <span className={styles.requirementText}>{option.Requirement_Text}</span>
                      </p>
                    )}
                    {option.outcomes && option.outcomes.length > 0 && (
                      <div className={styles.outcomePreview}>
                        {option.outcomes.map(outcome => (
                          <small key={outcome.Outcome_ID} className={styles.outcomeText}>
                            {outcome.Outcome_Description}
                          </small>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedOption && (
              <div className={styles.submitSection}>
                <button 
                  className={styles.submitBtn}
                  onClick={() => handleSubmitChoice(step.Step_ID)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '提交中...' : '確認選擇'}
                </button>
              </div>
            )}
          </>
        )}

        {isCompleted && step.chosenOption && (
          <div className={styles.completedSection}>
            <h4 className={styles.completedTitle}>✓ 已完成</h4>
            <p className={styles.completedChoice}>選擇: {step.chosenOption.Option_Text}</p>
            {step.outcomes && step.outcomes.length > 0 && (
              <div className={styles.completedOutcomes}>
                {step.outcomes.map(outcome => (
                  <p key={outcome.Outcome_ID} className={styles.completedResult}>
                    {outcome.Outcome_Description}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getCurrentSteps = () => {
    switch (activeTab) {
      case 'active': return eventsData.availableEvents || [];
      case 'completed': return eventsData.completedEvents || [];
      default: return [];
    }
  };

  const currentSteps = getCurrentSteps();

  return (
    <>
      <h1 className={styles.title}>互動事件</h1>

      {/* 統計資訊 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{eventsData.stats.total}</span>
          <span className={styles.statLabel}>總步驟</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{eventsData.stats.available}</span>
          <span className={styles.statLabel}>可參與</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{eventsData.stats.completed}</span>
          <span className={styles.statLabel}>已完成</span>
        </div>
      </div>

      {/* 分頁 */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          可參與事件 ({eventsData.availableEvents?.length || 0})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          已完成事件 ({eventsData.completedEvents?.length || 0})
        </button>
      </div>

      {/* 事件內容 */}
      <div className={styles.content}>
        {currentSteps.length > 0 ? (
          <div className={styles.eventsList}>
            {currentSteps.map(step => renderStepCard(step, activeTab === 'completed'))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎭</div>
            <p className={styles.emptyText}>
              {activeTab === 'active' && '目前沒有可參與的事件步驟'}
              {activeTab === 'completed' && '目前沒有已完成的事件步驟'}
            </p>
          </div>
        )}
      </div>

      {/* 結果彈窗 */}
      {showResult && (
        <div className={styles.resultModal}>
          <div className={styles.resultCard}>
            <h3 className={styles.resultTitle}>選擇結果</h3>
            <p className={styles.resultText}>你選擇了：{showResult.optionText}</p>
            
            {showResult.outcomes && showResult.outcomes.length > 0 && (
              <div className={styles.resultOutcomes}>
                {showResult.outcomes.map(outcome => (
                  <p key={outcome.Outcome_ID} className={styles.outcomeResult}>
                    {outcome.Outcome_Description}
                  </p>
                ))}
              </div>
            )}
            
            {showResult.changes && showResult.changes.length > 0 && (
              <div className={styles.resultChanges}>
                <h4 className={styles.changesTitle}>數值變化</h4>
                <p className={styles.changesList}>
                  {showResult.changes.join(', ')}
                </p>
              </div>
            )}

            {showResult.targetStepId && (
              <div className={styles.nextStepInfo}>
                <p className={styles.nextStepText}>
                  ✨ 解鎖了新的事件步驟，重新整理頁面查看！
                </p>
              </div>
            )}
            
            <button className={styles.closeBtn} onClick={closeResultModal}>
              確定
            </button>
          </div>
        </div>
      )}
    </>
  );
}