/**
 * 測試 GM 管理介面 API
 */

const BASE_URL = 'http://localhost:3000';

async function testCreateStep() {
  console.log('\n🧪 測試創建步驟 API');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/gm/campaigns/CAMP-LIB/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '測試步驟',
        description: '這是一個測試步驟的描述',
        imageUrl: '',
        isStartingStep: false
      })
    });
    
    const data = await response.json();
    
    console.log(`📡 狀態: ${response.status}`);
    console.log(`✅ 成功: ${data.success}`);
    
    if (data.success) {
      console.log(`🆔 新步驟 ID: ${data.data.Step_ID}`);
      console.log(`📖 步驟標題: ${data.data.Step_Title}`);
      return data.data.Step_ID;
    } else {
      console.error(`❌ 錯誤: ${data.error}`);
      return null;
    }
    
  } catch (error) {
    console.error(`💥 請求失敗: ${error.message}`);
    return null;
  }
}

async function testGetCampaignDesign() {
  console.log('\n🧪 測試獲取戰役設計 API');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/gm/campaigns/CAMP-LIB/design`);
    const data = await response.json();
    
    console.log(`📡 狀態: ${response.status}`);
    console.log(`✅ 成功: ${data.success}`);
    
    if (data.success) {
      console.log(`📊 步驟數量: ${data.data.steps.length}`);
      console.log(`🎲 選項數量: ${data.data.options.length}`);
      console.log(`🎯 結果數量: ${data.data.outcomes.length}`);
      
      console.log('📝 步驟列表:');
      data.data.steps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.Step_ID}: ${step.Step_Title}`);
      });
      
      return true;
    } else {
      console.error(`❌ 錯誤: ${data.error}`);
      return false;
    }
    
  } catch (error) {
    console.error(`💥 請求失敗: ${error.message}`);
    return false;
  }
}

async function testCreateOption(stepId) {
  console.log('\n🧪 測試創建選項 API');
  console.log('=' .repeat(50));
  
  if (!stepId) {
    console.log('⚠️  跳過選項測試：沒有步驟 ID');
    return false;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/gm/campaigns/CAMP-LIB/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceStepId: stepId,
        targetStepId: 'LIB-START', // 指向現有步驟
        optionText: '測試選項：返回起始點',
        requirementText: '[測試需求]'
      })
    });
    
    const data = await response.json();
    
    console.log(`📡 狀態: ${response.status}`);
    console.log(`✅ 成功: ${data.success}`);
    
    if (data.success) {
      console.log(`🆔 新選項 ID: ${data.data.Option_ID}`);
      console.log(`📝 選項文字: ${data.data.Option_Text}`);
      return data.data.Option_ID;
    } else {
      console.error(`❌ 錯誤: ${data.error}`);
      return null;
    }
    
  } catch (error) {
    console.error(`💥 請求失敗: ${error.message}`);
    return null;
  }
}

async function runGMTests() {
  console.log('🚀 開始測試 GM 管理介面 API');
  console.log('服務器地址:', BASE_URL);
  
  const results = {
    designAPI: false,
    createStep: false,
    createOption: false
  };
  
  // 1. 測試獲取戰役設計
  results.designAPI = await testGetCampaignDesign();
  
  // 2. 測試創建步驟
  const newStepId = await testCreateStep();
  results.createStep = !!newStepId;
  
  // 3. 測試創建選項
  const newOptionId = await testCreateOption(newStepId);
  results.createOption = !!newOptionId;
  
  // 總結
  console.log('\n' + '=' .repeat(60));
  console.log('📋 GM API 測試結果:');
  console.log('=' .repeat(60));
  
  const testNames = {
    designAPI: '獲取戰役設計',
    createStep: '創建新步驟',
    createOption: '創建新選項'
  };
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${testNames[test].padEnd(15)} ${status}`);
  });
  
  const passCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 總結: ${passCount}/${Object.keys(results).length} GM API 測試通過`);
  
  if (passCount === Object.keys(results).length) {
    console.log('🎉 GM 管理介面 API 全部正常！');
  } else {
    console.log('⚠️  部分 GM API 需要進一步修正');
  }
}

runGMTests();