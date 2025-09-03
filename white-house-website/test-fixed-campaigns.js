/**
 * 測試修正後的戰役系統
 */

const BASE_URL = 'http://localhost:3000';

async function testCampaign(campaignId, characterId, campaignName) {
  console.log(`\n🎯 測試戰役: ${campaignName} (${campaignId})`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/campaigns/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId: characterId,
        campaignId: campaignId,
        action: 'start'
      })
    });
    
    const data = await response.json();
    
    console.log(`📡 狀態: ${response.status}`);
    console.log(`✅ 成功: ${data.success}`);
    
    if (data.success) {
      const gameData = data.data;
      console.log(`🎮 當前步驟: ${gameData.currentStep.Step_ID}`);
      console.log(`📖 步驟標題: ${gameData.currentStep.Step_Title}`);
      console.log(`📝 步驟描述: ${gameData.currentStep.Step_Description}`);
      console.log(`🎲 可用選項數: ${gameData.availableOptions.length}`);
      
      gameData.availableOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.Option_ID}: ${option.Option_Text}`);
        if (option.Requirement_Text) {
          console.log(`      條件: ${option.Requirement_Text}`);
        }
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

async function runTests() {
  console.log('🚀 開始測試修正後的戰役系統');
  console.log('服務器地址:', BASE_URL);
  
  const testResults = [];
  
  // 測試 CAMP-LIB 戰役
  const campLibResult = await testCampaign('CAMP-LIB', 'P001', '圖書室戰役 (CAMP-LIB)');
  testResults.push({ campaign: 'CAMP-LIB', success: campLibResult });
  
  // 測試 LIBRARY_MYSTERY 戰役
  const libraryResult = await testCampaign('LIBRARY_MYSTERY', 'P002', '圖書室戰役 (LIBRARY_MYSTERY)');
  testResults.push({ campaign: 'LIBRARY_MYSTERY', success: libraryResult });
  
  // 總結
  console.log('\n' + '=' .repeat(60));
  console.log('📋 測試結果總結:');
  console.log('=' .repeat(60));
  
  testResults.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    console.log(`${icon} ${result.campaign.padEnd(20)} ${status}`);
  });
  
  const passCount = testResults.filter(r => r.success).length;
  console.log(`\n🎯 總結: ${passCount}/${testResults.length} 戰役可正常運作`);
  
  if (passCount === testResults.length) {
    console.log('🎉 所有戰役系統正常！');
  } else {
    console.log('⚠️  部分戰役需要進一步修正');
  }
}

runTests();