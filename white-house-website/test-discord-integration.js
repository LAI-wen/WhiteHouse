/**
 * 測試 Discord 整合功能
 * 包括身份綁定和數值同步
 */

const BASE_URL = 'http://localhost:3000';

async function testDiscordBinding() {
  console.log('🚀 測試 Discord 身份綁定功能');
  console.log('服務器地址:', BASE_URL);
  console.log('=' .repeat(60));

  const testResults = {
    checkUnboundUser: false,
    bindCharacter: false,
    checkBoundUser: false,
    unbindCharacter: false,
    characterUpdate: false,
    getChangeHistory: false
  };

  const testDiscordId = '123456789012345678';
  const testUsername = 'TestUser';
  const testCharacterId = 'P001';

  try {
    // ============================================
    // 1. 測試未綁定用戶查詢
    // ============================================
    console.log('\n🎯 步驟 1: 測試未綁定用戶查詢');
    console.log('-' .repeat(40));
    
    const unboundResponse = await fetch(`${BASE_URL}/api/auth/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: testDiscordId,
        username: testUsername,
        discriminator: '0001'
      })
    });
    
    const unboundData = await unboundResponse.json();
    console.log(`📡 狀態: ${unboundResponse.status}`);
    console.log(`✅ 成功: ${unboundData.success}`);
    
    if (unboundData.success && unboundData.data.needBinding) {
      console.log(`🎮 可綁定角色數量: ${unboundData.data.availableCharacters.length}`);
      console.log('📋 可綁定角色:');
      unboundData.data.availableCharacters.slice(0, 3).forEach((char, index) => {
        console.log(`   ${index + 1}. ${char.characterId} - ${char.characterName} (${char.publicFaction})`);
      });
      testResults.checkUnboundUser = true;
    } else {
      console.error(`❌ 未綁定用戶測試失敗: ${unboundData.error || '未知錯誤'}`);
    }

    // ============================================
    // 2. 測試角色綁定
    // ============================================
    console.log('\n🎯 步驟 2: 測試角色綁定');
    console.log('-' .repeat(40));
    
    const bindResponse = await fetch(`${BASE_URL}/api/auth/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: testDiscordId,
        username: testUsername,
        discriminator: '0001',
        characterId: testCharacterId
      })
    });
    
    const bindData = await bindResponse.json();
    console.log(`📡 狀態: ${bindResponse.status}`);
    console.log(`✅ 成功: ${bindData.success}`);
    
    if (bindData.success) {
      console.log(`🔗 綁定成功: ${bindData.data.discordUsername} -> ${bindData.data.characterName}`);
      console.log(`🆔 角色 ID: ${bindData.data.characterId}`);
      testResults.bindCharacter = true;
    } else {
      console.error(`❌ 綁定測試失敗: ${bindData.error}`);
    }

    // ============================================
    // 3. 測試已綁定用戶查詢
    // ============================================
    console.log('\n🎯 步驟 3: 測試已綁定用戶查詢');
    console.log('-' .repeat(40));
    
    const boundResponse = await fetch(`${BASE_URL}/api/auth/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: testDiscordId,
        username: testUsername,
        discriminator: '0001'
      })
    });
    
    const boundData = await boundResponse.json();
    console.log(`📡 狀態: ${boundResponse.status}`);
    console.log(`✅ 成功: ${boundData.success}`);
    
    if (boundData.success && !boundData.data.needBinding) {
      console.log(`👤 綁定角色: ${boundData.data.characterName}`);
      console.log(`🏷️  陣營: ${boundData.data.publicFaction}`);
      console.log(`❤️  血量: ${boundData.data.hp}/${boundData.data.maxHp}`);
      console.log(`🧠 理智: ${boundData.data.san}/${boundData.data.maxSan}`);
      testResults.checkBoundUser = true;
    } else {
      console.error(`❌ 已綁定用戶測試失敗: ${boundData.error || '未知錯誤'}`);
    }

    // ============================================
    // 4. 測試角色數值更新
    // ============================================
    console.log('\n🎯 步驟 4: 測試角色數值更新');
    console.log('-' .repeat(40));
    
    const updateData = {
      HP: 85,
      SAN: 90,
      AP: 5,
      BP: 3
    };

    const updateResponse = await fetch(`${BASE_URL}/api/character/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId: testCharacterId,
        updates: updateData,
        source: 'discord_bot',
        reason: '測試數值更新功能'
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log(`📡 狀態: ${updateResponse.status}`);
    console.log(`✅ 成功: ${updateResult.success}`);
    
    if (updateResult.success) {
      console.log(`📊 更新了 ${updateResult.data.updatedFields.length} 個數值:`);
      updateResult.data.changes.forEach(change => {
        console.log(`   ${change.field}: ${change.from} -> ${change.to}`);
      });
      testResults.characterUpdate = true;
    } else {
      console.error(`❌ 數值更新測試失敗: ${updateResult.error}`);
    }

    // ============================================
    // 5. 測試變更歷史查詢
    // ============================================
    console.log('\n🎯 步驟 5: 測試變更歷史查詢');
    console.log('-' .repeat(40));
    
    const historyResponse = await fetch(`${BASE_URL}/api/character/update?characterId=${testCharacterId}&limit=10`);
    const historyData = await historyResponse.json();
    
    console.log(`📡 狀態: ${historyResponse.status}`);
    console.log(`✅ 成功: ${historyData.success}`);
    
    if (historyData.success) {
      console.log(`📚 變更歷史記錄: ${historyData.data.changes.length}/${historyData.data.total} 筆`);
      historyData.data.changes.slice(0, 3).forEach((change, index) => {
        const time = new Date(change.Timestamp).toLocaleString();
        console.log(`   ${index + 1}. ${change.Target_Field}: ${change.Old_Value} -> ${change.New_Value} (${time})`);
      });
      testResults.getChangeHistory = true;
    } else {
      console.error(`❌ 變更歷史測試失敗: ${historyData.error}`);
    }

    // ============================================
    // 6. 清理：解除綁定
    // ============================================
    console.log('\n🎯 步驟 6: 清理測試 - 解除綁定');
    console.log('-' .repeat(40));
    
    const unbindResponse = await fetch(`${BASE_URL}/api/auth/discord`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: testDiscordId
      })
    });
    
    const unbindData = await unbindResponse.json();
    console.log(`📡 狀態: ${unbindResponse.status}`);
    console.log(`✅ 成功: ${unbindData.success}`);
    
    if (unbindData.success) {
      console.log(`🔓 綁定已解除: ${testDiscordId}`);
      testResults.unbindCharacter = true;
    } else {
      console.error(`❌ 解除綁定測試失敗: ${unbindData.error}`);
    }

  } catch (error) {
    console.error(`💥 測試過程中發生錯誤: ${error.message}`);
  }

  // ============================================
  // 總結
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Discord 整合功能測試結果:');
  console.log('=' .repeat(60));
  
  const testNames = {
    checkUnboundUser: '未綁定用戶查詢',
    bindCharacter: '角色綁定功能',
    checkBoundUser: '已綁定用戶查詢',
    characterUpdate: '角色數值更新',
    getChangeHistory: '變更歷史查詢',
    unbindCharacter: '解除綁定功能'
  };
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${testNames[test].padEnd(15)} ${status}`);
  });
  
  const passCount = Object.values(testResults).filter(Boolean).length;
  console.log(`\n🎯 總結: ${passCount}/${Object.keys(testResults).length} 項測試通過`);
  
  if (passCount === Object.keys(testResults).length) {
    console.log('🎉 Discord 整合功能完全正常！');
    console.log('💡 現在可以：');
    console.log('   - Discord 用戶自動綁定/解綁角色');
    console.log('   - 透過 Discord bot 更新角色數值');
    console.log('   - 查詢角色變更歷史');
    console.log('   - 在戰役中同步數值變化');
  } else {
    console.log('⚠️  部分功能需要進一步調整');
  }

  return testResults;
}

// 工具函數
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 執行測試
runDiscordIntegrationTests();

async function runDiscordIntegrationTests() {
  const results = await testDiscordBinding();
  console.log('\n🧪 Discord 整合測試完成');
  process.exit(0);
}