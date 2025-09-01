/**
 * 併發功能測試腳本
 * 
 * 測試多人同時進行戰役是否會產生衝突
 * 使用方法：node scripts/test-concurrency.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_CAMPAIGN_ID = 'LIBRARY_MYSTERY';

// 測試用戶
const TEST_USERS = [
  { characterId: 'P001', name: '玩家A' },
  { characterId: 'P002', name: '玩家B' },
  { characterId: 'P003', name: '玩家C' }
];

// 模擬 API 請求
async function makeRequest(endpoint, body, userName = '') {
  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    console.log(`📡 [${userName}] ${endpoint}:`, {
      status: response.status,
      success: data.success,
      error: data.error || 'None'
    });
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ [${userName}] ${endpoint} 請求失敗:`, error.message);
    return { status: 500, data: { success: false, error: error.message } };
  }
}

// 測試 1: 基本 API 功能
async function testBasicAPI() {
  console.log('\n🧪 測試 1: 基本 API 功能');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS[0];
  
  // 測試開始戰役
  const startResponse = await makeRequest('campaigns/play', {
    characterId: user.characterId,
    campaignId: TEST_CAMPAIGN_ID,
    action: 'start'
  }, user.name);
  
  if (startResponse.status === 200 && startResponse.data.success) {
    console.log('✅ 基本API功能正常');
    return startResponse.data.data;
  } else {
    console.error('❌ 基本API功能異常');
    return null;
  }
}

// 測試 2: 多用戶同時開始戰役
async function testConcurrentStart() {
  console.log('\n🧪 測試 2: 多用戶同時開始戰役');
  console.log('=' .repeat(50));
  
  const promises = TEST_USERS.map(user => 
    makeRequest('campaigns/play', {
      characterId: user.characterId,
      campaignId: TEST_CAMPAIGN_ID,
      action: 'start'
    }, user.name)
  );
  
  const results = await Promise.all(promises);
  
  let successCount = 0;
  let sessionIds = [];
  
  results.forEach((result, index) => {
    if (result.status === 200 && result.data.success) {
      successCount++;
      console.log(`✅ ${TEST_USERS[index].name} 成功開始戰役`);
      
      // 檢查是否有獨立的 Session ID
      if (result.data.data && result.data.data.currentStep) {
        console.log(`   📋 當前步驟: ${result.data.data.currentStep.Step_ID}`);
      }
    } else {
      console.error(`❌ ${TEST_USERS[index].name} 開始戰役失敗: ${result.data.error}`);
    }
  });
  
  console.log(`\n📊 結果: ${successCount}/${TEST_USERS.length} 用戶成功開始戰役`);
  return successCount === TEST_USERS.length;
}

// 測試 3: 併發選擇測試
async function testConcurrentChoices() {
  console.log('\n🧪 測試 3: 併發選擇測試');
  console.log('=' .repeat(50));
  
  // 首先讓所有用戶開始戰役並獲取可用選項
  const startPromises = TEST_USERS.map(user => 
    makeRequest('campaigns/play', {
      characterId: user.characterId,
      campaignId: TEST_CAMPAIGN_ID,
      action: 'start'
    }, user.name)
  );
  
  const startResults = await Promise.all(startPromises);
  
  // 檢查每個用戶的可用選項
  const userChoices = [];
  startResults.forEach((result, index) => {
    if (result.status === 200 && result.data.success) {
      const user = TEST_USERS[index];
      const gameData = result.data.data;
      
      if (gameData.availableOptions && gameData.availableOptions.length > 0) {
        userChoices.push({
          user: user,
          currentStep: gameData.currentStep.Step_ID,
          options: gameData.availableOptions
        });
        
        console.log(`📋 ${user.name} 可用選項數量: ${gameData.availableOptions.length}`);
        gameData.availableOptions.forEach(option => {
          console.log(`   - ${option.Option_ID}: ${option.Option_Text}`);
        });
      }
    }
  });
  
  // 測試同時選擇相同選項
  if (userChoices.length >= 2) {
    console.log('\n🎯 測試同時選擇相同選項...');
    
    const firstOption = userChoices[0].options[0];
    const choicePromises = userChoices.slice(0, 2).map(userChoice => 
      makeRequest('campaigns/play', {
        characterId: userChoice.user.characterId,
        campaignId: TEST_CAMPAIGN_ID,
        action: 'choose',
        stepId: userChoice.currentStep,
        optionId: firstOption.Option_ID
      }, userChoice.user.name)
    );
    
    const choiceResults = await Promise.all(choicePromises);
    
    let choiceSuccessCount = 0;
    choiceResults.forEach((result, index) => {
      if (result.status === 200 && result.data.success) {
        choiceSuccessCount++;
        console.log(`✅ ${userChoices[index].user.name} 成功做出選擇`);
      } else if (result.status === 409) {
        console.log(`⚠️  ${userChoices[index].user.name} 遇到併發衝突: ${result.data.message}`);
      } else {
        console.error(`❌ ${userChoices[index].user.name} 選擇失敗: ${result.data.error}`);
      }
    });
    
    console.log(`\n📊 選擇結果: ${choiceSuccessCount} 個成功選擇`);
    return true;
  }
  
  console.log('⚠️  沒有足夠的用戶選項進行併發測試');
  return false;
}

// 測試 4: 版本衝突測試
async function testVersionConflict() {
  console.log('\n🧪 測試 4: 版本衝突檢測');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS[0];
  
  // 快速連續發送兩個相同的選擇請求
  const promises = [1, 2].map(i => 
    makeRequest('campaigns/play', {
      characterId: user.characterId,
      campaignId: TEST_CAMPAIGN_ID,
      action: 'choose',
      stepId: 'LIB-001', // 假設的步驟ID
      optionId: 'LIB-001-A' // 假設的選項ID
    }, `${user.name}-請求${i}`)
  );
  
  const results = await Promise.all(promises);
  
  let conflictDetected = false;
  results.forEach((result, index) => {
    if (result.status === 409 && result.data.error === 'CONCURRENT_MODIFICATION') {
      conflictDetected = true;
      console.log(`✅ 成功檢測到版本衝突 (請求${index + 1})`);
    } else if (result.status === 200) {
      console.log(`✅ 請求${index + 1} 正常處理`);
    } else {
      console.log(`⚠️  請求${index + 1} 其他錯誤: ${result.data.error}`);
    }
  });
  
  return conflictDetected;
}

// 主測試函數
async function runAllTests() {
  console.log('🚀 開始併發功能測試');
  console.log('服務器地址:', BASE_URL);
  console.log('測試戰役ID:', TEST_CAMPAIGN_ID);
  console.log('測試用戶數量:', TEST_USERS.length);
  console.log('\n' + '='.repeat(60));
  
  const results = {
    basicAPI: false,
    concurrentStart: false,
    concurrentChoices: false,
    versionConflict: false
  };
  
  try {
    // 測試 1: 基本功能
    const basicData = await testBasicAPI();
    results.basicAPI = !!basicData;
    
    if (!results.basicAPI) {
      console.log('\n❌ 基本API測試失敗，跳過後續測試');
      return results;
    }
    
    // 測試 2: 併發開始
    results.concurrentStart = await testConcurrentStart();
    
    // 測試 3: 併發選擇
    results.concurrentChoices = await testConcurrentChoices();
    
    // 測試 4: 版本衝突
    results.versionConflict = await testVersionConflict();
    
  } catch (error) {
    console.error('\n💥 測試過程中發生錯誤:', error.message);
  }
  
  // 輸出測試總結
  console.log('\n' + '='.repeat(60));
  console.log('📋 測試結果總結:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.padEnd(20)} ${status}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 總體結果: ${passedCount}/${totalCount} 測試通過`);
  
  if (passedCount === totalCount) {
    console.log('🎉 所有併發測試通過！系統併發安全性良好。');
  } else {
    console.log('⚠️  部分測試未通過，請檢查相關功能。');
  }
  
  return results;
}

// 執行測試
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testBasicAPI, testConcurrentStart, testConcurrentChoices };