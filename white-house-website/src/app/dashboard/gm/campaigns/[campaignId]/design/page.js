'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './design.module.css';

export default function CampaignDesignPage() {
  const [user, setUser] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [steps, setSteps] = useState([]);
  const [options, setOptions] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('steps');
  const [showStepModal, setShowStepModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId;

  // 表單數據
  const [stepForm, setStepForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isStartingStep: false,
    options: [] // 新增選項列表
  });

  const [newOptionForm, setNewOptionForm] = useState({
    targetStepId: '',
    optionText: '',
    reqStatName: '',
    reqStatOperator: '',
    reqStatValue: '',
    requirementText: '',
    // 新增字段
    actionType: 'goto', // 'goto' | 'outcome' | 'both'
    newStepTitle: '',
    newStepDescription: '',
    outcomeType: '',
    outcomeValue: '',
    outcomeDescription: ''
  });

  const [optionForm, setOptionForm] = useState({
    sourceStepId: '',
    targetStepId: '',
    optionText: '',
    reqStatName: '',
    reqStatOperator: '',
    reqStatValue: '',
    reqItemId: '',
    requirementText: '',
    isAvailable: true
  });

  const [outcomeForm, setOutcomeForm] = useState({
    triggerOptionId: '',
    outcomeType: 'CHANGE_STAT',
    outcomeTarget: '',
    outcomeValue: '',
    outcomeDescription: '',
    discordMessage: ''
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
      loadCampaignData();
    } catch (error) {
      console.error('Session parse error:', error);
      router.push('/login');
    }
  }, [router, campaignId]);

  const loadCampaignData = async () => {
    try {
      const response = await fetch(`/api/gm/campaigns/${campaignId}/design`);
      const data = await response.json();
      
      if (data.success) {
        setCampaign(data.data.campaign);
        setSteps(data.data.steps || []);
        setOptions(data.data.options || []);
        setOutcomes(data.data.outcomes || []);
      } else {
        console.error('載入戰役設計資料失敗:', data.error);
        alert('載入戰役資料失敗: ' + data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
      alert('載入戰役資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 步驟管理
  const handleCreateStep = () => {
    setStepForm({
      title: '',
      description: '',
      imageUrl: '',
      isStartingStep: false,
      options: []
    });
    setNewOptionForm({
      targetStepId: '',
      optionText: '',
      reqStatName: '',
      reqStatOperator: '',
      reqStatValue: '',
      requirementText: '',
      actionType: 'goto',
      newStepTitle: '',
      newStepDescription: '',
      outcomeType: '',
      outcomeValue: '',
      outcomeDescription: ''
    });
    setEditingItem(null);
    setShowStepModal(true);
  };

  const handleEditStep = (step) => {
    // 獲取該步驟的選項
    const stepOptions = options.filter(opt => opt.Source_Step_ID === step.Step_ID);
    
    setStepForm({
      title: step.Step_Title,
      description: step.Step_Description,
      imageUrl: step.Image_URL,
      isStartingStep: step.Is_Starting_Step === 'TRUE',
      options: stepOptions
    });
    setNewOptionForm({
      targetStepId: '',
      optionText: '',
      reqStatName: '',
      reqStatOperator: '',
      reqStatValue: '',
      requirementText: '',
      actionType: 'goto',
      newStepTitle: '',
      newStepDescription: '',
      outcomeType: '',
      outcomeValue: '',
      outcomeDescription: ''
    });
    setEditingItem(step);
    setShowStepModal(true);
  };

  // 新增選項到當前步驟表單
  const handleAddOptionToStep = () => {
    if (!newOptionForm.optionText.trim()) {
      alert('請輸入選項文字');
      return;
    }

    // 驗證必填字段
    if (newOptionForm.actionType === 'newstep' && !newOptionForm.newStepTitle.trim()) {
      alert('請輸入新步驟標題');
      return;
    }
    if (newOptionForm.actionType === 'outcome' && !newOptionForm.outcomeType) {
      alert('請選擇結果類型');
      return;
    }

    const newOption = {
      tempId: Date.now(), // 臨時ID用於前端顯示
      targetStepId: newOptionForm.targetStepId,
      optionText: newOptionForm.optionText,
      reqStatName: newOptionForm.reqStatName,
      reqStatOperator: newOptionForm.reqStatOperator,
      reqStatValue: newOptionForm.reqStatValue,
      requirementText: newOptionForm.requirementText,
      // 新增字段
      actionType: newOptionForm.actionType,
      newStepTitle: newOptionForm.newStepTitle,
      newStepDescription: newOptionForm.newStepDescription,
      outcomeType: newOptionForm.outcomeType,
      outcomeValue: newOptionForm.outcomeValue,
      outcomeDescription: newOptionForm.outcomeDescription
    };

    setStepForm(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));

    // 重置新選項表單
    setNewOptionForm({
      targetStepId: '',
      optionText: '',
      reqStatName: '',
      reqStatOperator: '',
      reqStatValue: '',
      requirementText: '',
      actionType: 'goto',
      newStepTitle: '',
      newStepDescription: '',
      outcomeType: '',
      outcomeValue: '',
      outcomeDescription: ''
    });
  };

  // 從當前步驟表單移除選項
  const handleRemoveOptionFromStep = (tempId) => {
    setStepForm(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.tempId !== tempId && opt.Option_ID !== tempId)
    }));
  };

  const handleSaveStep = async (e) => {
    e.preventDefault();
    
    try {
      // 先保存步驟
      const stepData = {
        campaignId,
        title: stepForm.title,
        description: stepForm.description,
        imageUrl: stepForm.imageUrl,
        isStartingStep: stepForm.isStartingStep
      };

      const stepUrl = editingItem 
        ? `/api/gm/campaigns/${campaignId}/steps/${editingItem.Step_ID}` 
        : `/api/gm/campaigns/${campaignId}/steps`;
      
      const stepMethod = editingItem ? 'PUT' : 'POST';

      const stepResponse = await fetch(stepUrl, {
        method: stepMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData)
      });

      const stepResult = await stepResponse.json();
      
      if (!stepResult.success) {
        alert('步驟操作失敗: ' + stepResult.error);
        return;
      }

      // 獲取步驟ID (新創建的或現有的)
      const stepId = editingItem ? editingItem.Step_ID : stepResult.data.Step_ID;

      // 處理選項 - 先刪除舊的選項(編輯模式)，然後創建新的選項
      if (editingItem) {
        // 刪除不在新列表中的現有選項
        const currentOptions = options.filter(opt => opt.Source_Step_ID === stepId);
        const optionsToKeep = stepForm.options.filter(opt => opt.Option_ID); // 有ID的是現有選項
        const optionsToDelete = currentOptions.filter(current => 
          !optionsToKeep.find(keep => keep.Option_ID === current.Option_ID)
        );

        for (const optionToDelete of optionsToDelete) {
          await fetch(`/api/gm/campaigns/${campaignId}/options/${optionToDelete.Option_ID}`, {
            method: 'DELETE'
          });
        }
      }

      // 創建新選項
      const newOptions = stepForm.options.filter(opt => !opt.Option_ID); // 沒有ID的是新選項
      
      for (const option of newOptions) {
        let finalTargetStepId = option.targetStepId;

        // 如果是創建新步驟，先創建步驟
        if (option.actionType === 'newstep') {
          const newStepData = {
            campaignId,
            title: option.newStepTitle,
            description: option.newStepDescription,
            imageUrl: '',
            isStartingStep: false
          };

          const newStepResponse = await fetch(`/api/gm/campaigns/${campaignId}/steps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newStepData)
          });

          const newStepResult = await newStepResponse.json();
          if (newStepResult.success) {
            finalTargetStepId = newStepResult.data.Step_ID;
          } else {
            console.error('創建新步驟失敗:', newStepResult.error);
            continue; // 跳過這個選項
          }
        }

        // 創建選項
        const optionData = {
          sourceStepId: stepId,
          targetStepId: finalTargetStepId,
          optionText: option.optionText,
          requirementText: option.requirementText,
          isRandomOutcome: false,
          randomChance: ''
        };

        const optionResponse = await fetch(`/api/gm/campaigns/${campaignId}/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(optionData)
        });

        const optionResult = await optionResponse.json();
        if (!optionResult.success) {
          console.error('創建選項失敗:', optionResult.error);
          continue;
        }

        // 如果是創建結果
        if (option.actionType === 'outcome' && option.outcomeType) {
          const outcomeData = {
            triggerOptionId: optionResult.data.Option_ID,
            outcomeType: option.outcomeType,
            outcomeTarget: option.outcomeValue, // 修正欄位名稱
            outcomeValue: option.outcomeValue,
            outcomeDescription: option.outcomeDescription,
            discordMessage: '' // 新增Discord訊息欄位
          };

          const outcomeResponse = await fetch(`/api/gm/campaigns/${campaignId}/outcomes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(outcomeData)
          });

          const outcomeResult = await outcomeResponse.json();
          if (!outcomeResult.success) {
            console.error('創建結果失敗:', outcomeResult.error);
          }
        }
      }

      setShowStepModal(false);
      loadCampaignData();
      alert(editingItem ? '步驟和選項已更新！' : '步驟和選項已創建！');
      
    } catch (error) {
      console.error('保存步驟錯誤:', error);
      alert('保存時發生錯誤');
    }
  };

  const handleDeleteStep = async (step) => {
    if (!confirm(`確定要刪除步驟「${step.Step_Title}」嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/gm/campaigns/${campaignId}/steps/${step.Step_ID}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        loadCampaignData();
        alert('步驟已刪除！');
      } else {
        alert('刪除失敗: ' + result.error);
      }
    } catch (error) {
      console.error('刪除步驟錯誤:', error);
      alert('刪除時發生錯誤');
    }
  };

  // 選項管理
  const handleCreateOption = () => {
    setOptionForm({
      sourceStepId: '',
      targetStepId: '',
      optionText: '',
      reqStatName: '',
      reqStatOperator: '',
      reqStatValue: '',
      reqItemId: '',
      requirementText: '',
      isAvailable: true
    });
    setEditingItem(null);
    setShowOptionModal(true);
  };

  const handleEditOption = (option) => {
    setOptionForm({
      sourceStepId: option.Source_Step_ID,
      targetStepId: option.Target_Step_ID,
      optionText: option.Option_Text,
      reqStatName: option.Req_Stat_Name,
      reqStatOperator: option.Req_Stat_Operator,
      reqStatValue: option.Req_Stat_Value,
      reqItemId: option.Req_Item_ID,
      requirementText: option.Requirement_Text,
      isAvailable: option.Is_Available === 'TRUE'
    });
    setEditingItem(option);
    setShowOptionModal(true);
  };

  const handleSaveOption = async (e) => {
    e.preventDefault();
    
    try {
      const optionData = {
        campaignId,
        sourceStepId: optionForm.sourceStepId,
        targetStepId: optionForm.targetStepId,
        optionText: optionForm.optionText,
        reqStatName: optionForm.reqStatName,
        reqStatOperator: optionForm.reqStatOperator,
        reqStatValue: optionForm.reqStatValue,
        reqItemId: optionForm.reqItemId,
        requirementText: optionForm.requirementText,
        isAvailable: optionForm.isAvailable
      };

      const url = editingItem 
        ? `/api/gm/campaigns/${campaignId}/options/${editingItem.Option_ID}` 
        : `/api/gm/campaigns/${campaignId}/options`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optionData)
      });

      const result = await response.json();
      
      if (result.success) {
        setShowOptionModal(false);
        loadCampaignData();
        alert(editingItem ? '選項已更新！' : '選項已創建！');
      } else {
        alert('操作失敗: ' + result.error);
      }
    } catch (error) {
      console.error('保存選項錯誤:', error);
      alert('保存時發生錯誤');
    }
  };

  const handleDeleteOption = async (option) => {
    if (!confirm(`確定要刪除選項「${option.Option_Text}」嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/gm/campaigns/${campaignId}/options/${option.Option_ID}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        loadCampaignData();
        alert('選項已刪除！');
      } else {
        alert('刪除失敗: ' + result.error);
      }
    } catch (error) {
      console.error('刪除選項錯誤:', error);
      alert('刪除時發生錯誤');
    }
  };

  if (loading || !user || !campaign) {
    return <div className={styles.loading}>載入中...</div>;
  }

  return (
    <div className={styles.designPage}>
      <div className={styles.header}>
        <div>
          <button 
            className={styles.backBtn}
            onClick={() => router.push('/dashboard/gm/campaigns')}
          >
            ← 返回戰役列表
          </button>
          <h1 className={styles.title}>🎨 設計戰役: {campaign.Campaign_Name}</h1>
          <p className={styles.subtitle}>{campaign.Campaign_Description}</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'steps' ? styles.active : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          📝 步驟管理 ({steps.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'options' ? styles.active : ''}`}
          onClick={() => setActiveTab('options')}
        >
          🔗 選項管理 ({options.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'outcomes' ? styles.active : ''}`}
          onClick={() => setActiveTab('outcomes')}
        >
          ⚡ 結果管理 ({outcomes.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ 預覽流程
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'steps' && (
          <div className={styles.stepPanel}>
            <div className={styles.panelHeader}>
              <h2>步驟管理</h2>
              <button className={styles.createBtn} onClick={handleCreateStep}>
                ➕ 新增步驟
              </button>
            </div>
            
            <div className={styles.itemsList}>
              {steps.map(step => (
                <div key={step.Step_ID} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{step.Step_Title}</h3>
                      <span className={`${styles.badge} ${step.Is_Starting_Step === 'TRUE' ? styles.starting : ''}`}>
                        {step.Is_Starting_Step === 'TRUE' ? '🏁 起始步驟' : '📄 普通步驟'}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.editBtn} onClick={() => handleEditStep(step)}>
                        ✏️ 編輯
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteStep(step)}>
                        🗑️ 刪除
                      </button>
                    </div>
                  </div>
                  <p className={styles.itemDesc}>{step.Step_Description}</p>
                  <div className={styles.stepStats}>
                    <span>選項數: {options.filter(opt => opt.Source_Step_ID === step.Step_ID).length}</span>
                  </div>
                </div>
              ))}
              
              {steps.length === 0 && (
                <div className={styles.empty}>
                  <p>還沒有任何步驟</p>
                  <button className={styles.createBtn} onClick={handleCreateStep}>
                    創建第一個步驟
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className={styles.optionPanel}>
            <div className={styles.panelHeader}>
              <h2>選項管理</h2>
              <button className={styles.createBtn} onClick={handleCreateOption}>
                ➕ 新增選項
              </button>
            </div>
            
            <div className={styles.itemsList}>
              {options.map(option => (
                <div key={option.Option_ID} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{option.Option_Text}</h3>
                      <div className={styles.optionFlow}>
                        <span className={styles.flowItem}>
                          從: {steps.find(s => s.Step_ID === option.Source_Step_ID)?.Step_Title || option.Source_Step_ID}
                        </span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.flowItem}>
                          到: {option.Target_Step_ID ? 
                            (steps.find(s => s.Step_ID === option.Target_Step_ID)?.Step_Title || option.Target_Step_ID) : 
                            '結束'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.editBtn} onClick={() => handleEditOption(option)}>
                        ✏️ 編輯
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteOption(option)}>
                        🗑️ 刪除
                      </button>
                    </div>
                  </div>
                  {option.Requirement_Text && (
                    <div className={styles.requirement}>
                      📋 需求: {option.Requirement_Text}
                    </div>
                  )}
                  <div className={styles.optionStats}>
                    <span>結果數: {outcomes.filter(out => out.Trigger_Option_ID === option.Option_ID).length}</span>
                  </div>
                </div>
              ))}
              
              {options.length === 0 && (
                <div className={styles.empty}>
                  <p>還沒有任何選項</p>
                  <button className={styles.createBtn} onClick={handleCreateOption}>
                    創建第一個選項
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className={styles.previewPanel}>
            <div className={styles.panelHeader}>
              <h2>流程預覽</h2>
              <button 
                className={styles.testBtn}
                onClick={() => window.open(`/dashboard/campaigns`, '_blank')}
              >
                🧪 測試遊玩
              </button>
            </div>
            
            <div className={styles.flowChart}>
              <p>流程圖功能開發中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 步驟創建/編輯彈窗 */}
      {showStepModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? '編輯步驟' : '創建新步驟'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowStepModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveStep} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>步驟標題 *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={stepForm.title}
                  onChange={(e) => setStepForm({...stepForm, title: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>步驟描述 *</label>
                <textarea
                  className={styles.textarea}
                  value={stepForm.description}
                  onChange={(e) => setStepForm({...stepForm, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>圖片網址 (選填)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={stepForm.imageUrl}
                  onChange={(e) => setStepForm({...stepForm, imageUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={stepForm.isStartingStep}
                    onChange={(e) => setStepForm({...stepForm, isStartingStep: e.target.checked})}
                  />
                  設為起始步驟
                </label>
              </div>

              {/* 選項管理區域 */}
              <div className={styles.formGroup}>
                <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px', marginTop: '20px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>步驟選項</h3>
                  
                  {/* 現有選項列表 */}
                  {stepForm.options.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>目前選項：</h4>
                      {stepForm.options.map((option, index) => (
                        <div key={option.tempId || option.Option_ID} style={{ 
                          background: '#f8f9fa', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px', 
                          padding: '12px', 
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {option.optionText || option.Option_Text}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {option.actionType === 'newstep' && `新步驟: ${option.newStepTitle}`}
                              {option.actionType === 'outcome' && `結果: ${option.outcomeType}`}
                              {option.actionType === 'goto' && `目標: ${option.targetStepId || option.Target_Step_ID}`}
                              {option.actionType === 'end' && '戰役結束'}
                              {!option.actionType && (option.targetStepId || option.Target_Step_ID ? `目標: ${option.targetStepId || option.Target_Step_ID}` : '戰役結束')}
                              {(option.requirementText || option.Requirement_Text) && (
                                <span> • 需求: {option.requirementText || option.Requirement_Text}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromStep(option.tempId || option.Option_ID)}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            刪除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 新增選項表單 */}
                  <div style={{ 
                    background: '#f0f8ff', 
                    border: '1px solid #cce7ff', 
                    borderRadius: '6px', 
                    padding: '16px' 
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px' }}>新增選項：</h4>
                    
                    {/* 選項文字 */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>選項文字 *</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={newOptionForm.optionText}
                        onChange={(e) => setNewOptionForm({...newOptionForm, optionText: e.target.value})}
                        placeholder="A. 檢查附近的書架"
                      />
                    </div>

                    {/* 動作類型選擇 */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>選項動作 *</label>
                      <select
                        className={styles.select}
                        value={newOptionForm.actionType}
                        onChange={(e) => setNewOptionForm({...newOptionForm, actionType: e.target.value})}
                      >
                        <option value="goto">前往現有步驟</option>
                        <option value="newstep">創建新步驟</option>
                        <option value="outcome">直接產生結果</option>
                        <option value="end">結束戰役</option>
                      </select>
                    </div>

                    {/* 根據動作類型顯示不同字段 */}
                    {newOptionForm.actionType === 'goto' && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>目標步驟</label>
                        <select
                          className={styles.select}
                          value={newOptionForm.targetStepId}
                          onChange={(e) => setNewOptionForm({...newOptionForm, targetStepId: e.target.value})}
                        >
                          <option value="">請選擇步驟</option>
                          {steps.filter(step => !editingItem || step.Step_ID !== editingItem.Step_ID).map(step => (
                            <option key={step.Step_ID} value={step.Step_ID}>
                              {step.Step_Title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {newOptionForm.actionType === 'newstep' && (
                      <div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>新步驟標題 *</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={newOptionForm.newStepTitle}
                            onChange={(e) => setNewOptionForm({...newOptionForm, newStepTitle: e.target.value})}
                            placeholder="書架調查結果"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>新步驟描述 *</label>
                          <textarea
                            className={styles.textarea}
                            value={newOptionForm.newStepDescription}
                            onChange={(e) => setNewOptionForm({...newOptionForm, newStepDescription: e.target.value})}
                            rows={3}
                            placeholder="你在書架上發現了一本古老的書籍..."
                          />
                        </div>
                      </div>
                    )}

                    {newOptionForm.actionType === 'outcome' && (
                      <div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>結果類型 *</label>
                            <select
                              className={styles.select}
                              value={newOptionForm.outcomeType}
                              onChange={(e) => setNewOptionForm({...newOptionForm, outcomeType: e.target.value})}
                            >
                              <option value="">請選擇</option>
                              <option value="CHANGE_STAT">屬性變化</option>
                              <option value="ADD_ITEM">獲得物品</option>
                              <option value="REMOVE_ITEM">失去物品</option>
                              <option value="STORY">劇情描述</option>
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>數值/物品ID</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={newOptionForm.outcomeValue}
                              onChange={(e) => setNewOptionForm({...newOptionForm, outcomeValue: e.target.value})}
                              placeholder="INT+2 或 ITEM001"
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>結果描述</label>
                          <textarea
                            className={styles.textarea}
                            value={newOptionForm.outcomeDescription}
                            onChange={(e) => setNewOptionForm({...newOptionForm, outcomeDescription: e.target.value})}
                            rows={2}
                            placeholder="你的智力得到了提升..."
                          />
                        </div>
                      </div>
                    )}

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>需求屬性</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={newOptionForm.reqStatName}
                          onChange={(e) => setNewOptionForm({...newOptionForm, reqStatName: e.target.value})}
                          placeholder="INT, DEX, STR..."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>操作符</label>
                        <select
                          className={styles.select}
                          value={newOptionForm.reqStatOperator}
                          onChange={(e) => setNewOptionForm({...newOptionForm, reqStatOperator: e.target.value})}
                        >
                          <option value="">無</option>
                          <option value=">">大於</option>
                          <option value=">=">大於等於</option>
                          <option value="<">小於</option>
                          <option value="<=">小於等於</option>
                          <option value="=">等於</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>需求數值</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={newOptionForm.reqStatValue}
                          onChange={(e) => setNewOptionForm({...newOptionForm, reqStatValue: e.target.value})}
                          placeholder="12"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>需求描述 (給玩家看)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={newOptionForm.requirementText}
                        onChange={(e) => setNewOptionForm({...newOptionForm, requirementText: e.target.value})}
                        placeholder="[需要 INT > 12]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddOptionToStep}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      新增選項
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowStepModal(false)}>
                  取消
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingItem ? '更新步驟' : '創建步驟'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 選項創建/編輯彈窗 */}
      {showOptionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? '編輯選項' : '創建新選項'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowOptionModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveOption} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>來源步驟 *</label>
                <select
                  className={styles.select}
                  value={optionForm.sourceStepId}
                  onChange={(e) => setOptionForm({...optionForm, sourceStepId: e.target.value})}
                  required
                >
                  <option value="">請選擇步驟</option>
                  {steps.map(step => (
                    <option key={step.Step_ID} value={step.Step_ID}>
                      {step.Step_Title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>目標步驟 (留空表示結束)</label>
                <select
                  className={styles.select}
                  value={optionForm.targetStepId}
                  onChange={(e) => setOptionForm({...optionForm, targetStepId: e.target.value})}
                >
                  <option value="">戰役結束</option>
                  {steps.map(step => (
                    <option key={step.Step_ID} value={step.Step_ID}>
                      {step.Step_Title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>選項文字 *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={optionForm.optionText}
                  onChange={(e) => setOptionForm({...optionForm, optionText: e.target.value})}
                  required
                  placeholder="A. 檢查附近的書架"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>需求屬性</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={optionForm.reqStatName}
                    onChange={(e) => setOptionForm({...optionForm, reqStatName: e.target.value})}
                    placeholder="INT, DEX, STR..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>操作符</label>
                  <select
                    className={styles.select}
                    value={optionForm.reqStatOperator}
                    onChange={(e) => setOptionForm({...optionForm, reqStatOperator: e.target.value})}
                  >
                    <option value="">無</option>
                    <option value=">">大於</option>
                    <option value=">=">大於等於</option>
                    <option value="<">小於</option>
                    <option value="<=">小於等於</option>
                    <option value="=">等於</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>需求數值</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={optionForm.reqStatValue}
                    onChange={(e) => setOptionForm({...optionForm, reqStatValue: e.target.value})}
                    placeholder="12"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>需求描述 (給玩家看)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={optionForm.requirementText}
                  onChange={(e) => setOptionForm({...optionForm, requirementText: e.target.value})}
                  placeholder="[需要 INT > 12]"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={optionForm.isAvailable}
                    onChange={(e) => setOptionForm({...optionForm, isAvailable: e.target.checked})}
                  />
                  啟用選項
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowOptionModal(false)}>
                  取消
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingItem ? '更新選項' : '創建選項'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}