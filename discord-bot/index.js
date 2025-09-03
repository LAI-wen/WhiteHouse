const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Discord Bot 初始化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 命令集合
client.commands = new Collection();

// 定義基礎指令
const commands = [
  // 身份綁定指令
  new SlashCommandBuilder()
    .setName('bind')
    .setDescription('綁定你的遊戲角色')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('你的遊戲角色名稱')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('password')
        .setDescription('你的遊戲密碼')
        .setRequired(true)),

  // 查詢狀態指令  
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('查詢你的角色狀態'),

  // 擲骰指令
  new SlashCommandBuilder()
    .setName('roll')
    .setDescription('擲骰判定')
    .addStringOption(option =>
      option.setName('dice')
        .setDescription('擲骰公式 (例如: 1d100, 3d6)')
        .setRequired(false)),

  // 解除綁定指令
  new SlashCommandBuilder()
    .setName('unbind')
    .setDescription('解除Discord身份綁定'),

  // 數值更新指令
  new SlashCommandBuilder()
    .setName('update')
    .setDescription('更新你的角色數值')
    .addStringOption(option =>
      option.setName('stat')
        .setDescription('要更新的數值名稱')
        .setRequired(true)
        .addChoices(
          { name: 'HP (生命值)', value: 'HP' },
          { name: 'SAN (理智值)', value: 'SAN' },
          { name: 'AP (行動點)', value: 'AP' },
          { name: 'BP (技能點)', value: 'BP' },
          { name: 'STR (力量)', value: 'STR' },
          { name: 'CON (體質)', value: 'CON' },
          { name: 'DEX (敏捷)', value: 'DEX' },
          { name: 'APP (外貌)', value: 'APP' },
          { name: 'INT (智力)', value: 'INT' },
          { name: 'LUCK (幸運)', value: 'LUCK' }
        ))
    .addIntegerOption(option =>
      option.setName('value')
        .setDescription('新的數值')
        .setRequired(true)),

  // 數值調整指令（相對變更）
  new SlashCommandBuilder()
    .setName('adjust')
    .setDescription('調整你的角色數值（相對變更）')
    .addStringOption(option =>
      option.setName('stat')
        .setDescription('要調整的數值名稱')
        .setRequired(true)
        .addChoices(
          { name: 'HP (生命值)', value: 'HP' },
          { name: 'SAN (理智值)', value: 'SAN' },
          { name: 'AP (行動點)', value: 'AP' },
          { name: 'BP (技能點)', value: 'BP' },
          { name: 'STR (力量)', value: 'STR' },
          { name: 'CON (體質)', value: 'CON' },
          { name: 'DEX (敏捷)', value: 'DEX' },
          { name: 'APP (外貌)', value: 'APP' },
          { name: 'INT (智力)', value: 'INT' },
          { name: 'LUCK (幸運)', value: 'LUCK' }
        ))
    .addIntegerOption(option =>
      option.setName('change')
        .setDescription('變更量（可以是負數）')
        .setRequired(true)),

  // 變更歷史指令
  new SlashCommandBuilder()
    .setName('history')
    .setDescription('查看你的角色變更歷史')
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('顯示最近的變更數量（預設10筆）')
        .setRequired(false)),

  // 幫助指令
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('顯示指令幫助')
];

// API 請求輔助函數
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${process.env.WEBSITE_API_BASE}${endpoint}`;
    console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const result = await response.json();
    console.log(`📡 API Response (${response.status}):`, result);
    
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: `API請求失敗: ${error.message}` };
  }
}

// 指令處理函數
const commandHandlers = {
  // 綁定身份
  async bind(interaction) {
    const username = interaction.options.getString('username');
    const password = interaction.options.getString('password');
    const discordId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      // 驗證角色身份
      const authResult = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (!authResult.success) {
        return await interaction.editReply('❌ 角色驗證失敗，請檢查用戶名和密碼');
      }

      // 綁定Discord身份  
      const characterId = authResult.data.characterId || authResult.data.Character_ID;
      const bindResult = await apiRequest('/auth/discord', {
        method: 'POST',
        body: JSON.stringify({
          characterId: characterId,
          discordId: discordId
        })
      });

      if (bindResult.success) {
        const characterName = bindResult.data?.characterName || authResult.data?.characterName || '未知角色';
        await interaction.editReply(`✅ 成功綁定角色：${characterName}`);
      } else {
        await interaction.editReply(`❌ 綁定失敗：${bindResult.error}`);
      }

    } catch (error) {
      console.error('Bind command error:', error);
      await interaction.editReply('❌ 綁定過程中發生錯誤');
    }
  },

  // 查詢狀態
  async status(interaction) {
    const discordId = interaction.user.id;
    
    // 立即回應，避免超時
    await interaction.reply({ content: '🔍 正在查詢角色狀態...', ephemeral: true });

    try {
      // 使用 POST 方法查詢，不提供 characterId 就是查詢現有綁定
      const result = await apiRequest('/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ 
          discordId: discordId,
          username: interaction.user.username,
          discriminator: interaction.user.discriminator || '0000'
        })
      });
      
      
      if (!result.success || !result.data || result.data.needBinding) {
        return await interaction.editReply('❌ 未找到綁定的角色，請使用 `/bind` 指令綁定');
      }

      const character = result.data;
      
      // 統一欄位名稱處理
      const getFieldValue = (field, defaultValue = '0') => {
        return character[field] || character[field.toLowerCase()] || 
               character[field.replace('_', '')] || defaultValue;
      };
      
      const statusEmbed = {
        color: 0x0099FF,
        title: `📊 ${character.characterName || character.Character_Name || '角色'} 的狀態`,
        fields: [
          // 基礎數值
          { 
            name: '💚 生命值', 
            value: `${getFieldValue('hp') || getFieldValue('HP')}/${getFieldValue('maxHp') || getFieldValue('Max_HP', '999')}`, 
            inline: true 
          },
          { 
            name: '💙 理智值', 
            value: `${getFieldValue('san') || getFieldValue('SAN')}/${getFieldValue('maxSan') || getFieldValue('Max_SAN', '999')}`, 
            inline: true 
          },
          { name: '⚡ 行動點', value: (getFieldValue('ap') || getFieldValue('AP')).toString(), inline: true },
          
          // 基礎屬性
          { name: '💪 力量 (STR)', value: (getFieldValue('str') || getFieldValue('STR')).toString(), inline: true },
          { name: '🛡️ 體質 (CON)', value: (getFieldValue('con') || getFieldValue('CON')).toString(), inline: true },
          { name: '🏃 敏捷 (DEX)', value: (getFieldValue('dex') || getFieldValue('DEX')).toString(), inline: true },
          { name: '✨ 外貌 (APP)', value: (getFieldValue('app') || getFieldValue('APP')).toString(), inline: true },
          { name: '🧠 智力 (INT)', value: (getFieldValue('int') || getFieldValue('INT')).toString(), inline: true },
          { name: '🍀 幸運 (LUCK)', value: (getFieldValue('luck') || getFieldValue('LUCK')).toString(), inline: true },
          
          // 點數系統
          { name: '🎯 技能點 (BP)', value: (getFieldValue('bp') || getFieldValue('BP')).toString(), inline: true },
          { name: '😇 好孩子點數', value: (getFieldValue('Good_Boy_Points')).toString(), inline: true },
          { name: '🏆 表現點數', value: (getFieldValue('Performance_Points')).toString(), inline: true },
          
          // 陣營資訊
          { name: '🏛️ 陣營', value: getFieldValue('publicFaction') || getFieldValue('Public_Faction', '未設定'), inline: true }
        ],
        timestamp: new Date(),
        footer: { text: 'White House TRPG Bot - 完整數值顯示' }
      };

      await interaction.editReply({ content: '', embeds: [statusEmbed] });

    } catch (error) {
      console.error('Status command error:', error);
      await interaction.editReply('❌ 查詢狀態時發生錯誤');
    }
  },

  // 擲骰功能
  async roll(interaction) {
    const diceInput = interaction.options.getString('dice') || '1d100';
    
    try {
      // 基礎擲骰解析
      const match = diceInput.match(/(\d+)d(\d+)([+-]\d+)?/i);
      if (!match) {
        return await interaction.reply('❌ 無效的擲骰格式，請使用如 1d100 或 3d6+2 的格式');
      }

      const numDice = parseInt(match[1]);
      const diceSides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;

      if (numDice > 10 || diceSides > 100) {
        return await interaction.reply('❌ 骰子數量不能超過10個，面數不能超過100');
      }

      const rolls = [];
      let total = 0;

      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * diceSides) + 1;
        rolls.push(roll);
        total += roll;
      }

      total += modifier;

      const resultEmbed = {
        color: 0x00FF00,
        title: '🎲 擲骰結果',
        fields: [
          { name: '擲骰', value: diceInput, inline: true },
          { name: '各骰結果', value: rolls.join(', '), inline: true },
          { name: '總和', value: total.toString(), inline: true }
        ],
        footer: { text: `${interaction.user.displayName} 的擲骰` }
      };

      await interaction.reply({ embeds: [resultEmbed] });

    } catch (error) {
      console.error('Roll command error:', error);
      await interaction.reply('❌ 擲骰時發生錯誤');
    }
  },

  // 解除綁定
  async unbind(interaction) {
    const discordId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await apiRequest('/auth/discord', {
        method: 'DELETE',
        body: JSON.stringify({ discordId })
      });

      if (result.success) {
        await interaction.editReply('✅ 成功解除Discord身份綁定');
      } else {
        await interaction.editReply(`❌ 解除綁定失敗：${result.error}`);
      }

    } catch (error) {
      console.error('Unbind command error:', error);
      await interaction.editReply('❌ 解除綁定時發生錯誤');
    }
  },

  // 數值更新指令
  async update(interaction) {
    const stat = interaction.options.getString('stat');
    const value = interaction.options.getInteger('value');
    const discordId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      // 先獲取綁定的角色資訊
      const statusResult = await apiRequest('/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ 
          discordId: discordId,
          username: interaction.user.username,
          discriminator: interaction.user.discriminator || '0000'
        })
      });

      if (!statusResult.success || !statusResult.data || statusResult.data.needBinding) {
        return await interaction.editReply('❌ 請先使用 `/bind` 指令綁定角色');
      }

      const characterId = statusResult.data.characterId;

      // 執行數值更新
      const updateResult = await apiRequest('/character/update', {
        method: 'POST',
        body: JSON.stringify({
          characterId: characterId,
          updates: { [stat]: value },
          source: 'discord_bot',
          reason: `Discord用戶 ${interaction.user.username} 手動更新`
        })
      });

      if (updateResult.success) {
        const change = updateResult.data.changes[0];
        await interaction.editReply(
          `✅ 成功更新 **${stat}**\n` +
          `從 \`${change.from}\` 變更為 \`${change.to}\``
        );
      } else {
        await interaction.editReply(`❌ 更新失敗：${updateResult.error}`);
      }

    } catch (error) {
      console.error('Update command error:', error);
      await interaction.editReply('❌ 更新數值時發生錯誤');
    }
  },

  // 數值調整指令
  async adjust(interaction) {
    const stat = interaction.options.getString('stat');
    const change = interaction.options.getInteger('change');
    const discordId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      // 先獲取綁定的角色資訊
      const statusResult = await apiRequest('/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ 
          discordId: discordId,
          username: interaction.user.username,
          discriminator: interaction.user.discriminator || '0000'
        })
      });

      if (!statusResult.success || !statusResult.data || statusResult.data.needBinding) {
        return await interaction.editReply('❌ 請先使用 `/bind` 指令綁定角色');
      }

      const character = statusResult.data;
      const currentValue = parseInt(character[stat.toLowerCase()] || character[stat] || '0');
      const newValue = currentValue + change;

      // 執行數值更新
      const updateResult = await apiRequest('/character/update', {
        method: 'POST',
        body: JSON.stringify({
          characterId: character.characterId,
          updates: { [stat]: newValue },
          source: 'discord_bot',
          reason: `Discord用戶 ${interaction.user.username} 調整數值 ${change > 0 ? '+' : ''}${change}`
        })
      });

      if (updateResult.success) {
        const changeInfo = updateResult.data.changes[0];
        await interaction.editReply(
          `✅ 成功調整 **${stat}** ${change > 0 ? '+' : ''}${change}\n` +
          `從 \`${changeInfo.from}\` 變更為 \`${changeInfo.to}\``
        );
      } else {
        await interaction.editReply(`❌ 調整失敗：${updateResult.error}`);
      }

    } catch (error) {
      console.error('Adjust command error:', error);
      await interaction.editReply('❌ 調整數值時發生錯誤');
    }
  },

  // 變更歷史指令
  async history(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;
    const discordId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      // 先獲取綁定的角色資訊
      const statusResult = await apiRequest('/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ 
          discordId: discordId,
          username: interaction.user.username,
          discriminator: interaction.user.discriminator || '0000'
        })
      });

      if (!statusResult.success || !statusResult.data || statusResult.data.needBinding) {
        return await interaction.editReply('❌ 請先使用 `/bind` 指令綁定角色');
      }

      const characterId = statusResult.data.characterId;

      // 獲取變更歷史
      const historyResult = await apiRequest(`/character/update?characterId=${characterId}&limit=${limit}`);

      if (!historyResult.success) {
        return await interaction.editReply('❌ 無法獲取變更歷史');
      }

      const changes = historyResult.data.changes;
      if (changes.length === 0) {
        return await interaction.editReply('📋 沒有找到變更記錄');
      }

      const historyEmbed = {
        color: 0xFF9900,
        title: `📋 ${statusResult.data.characterName} 的變更歷史`,
        description: `顯示最近 ${changes.length} 筆變更`,
        fields: changes.map(change => ({
          name: `${change.Target_Field} 變更`,
          value: `\`${change.Old_Value}\` → \`${change.New_Value}\`\n` +
                 `🕐 ${new Date(change.Timestamp).toLocaleString('zh-TW')}\n` +
                 `📝 ${change.Source}`,
          inline: true
        })),
        footer: { text: `總共 ${historyResult.data.total} 筆記錄` }
      };

      await interaction.editReply({ embeds: [historyEmbed] });

    } catch (error) {
      console.error('History command error:', error);
      await interaction.editReply('❌ 查詢變更歷史時發生錯誤');
    }
  },

  // 幫助指令
  async help(interaction) {
    const helpEmbed = {
      color: 0x0099FF,
      title: '🏠 White House Bot 指令說明',
      description: '歡迎使用白房子TRPG機器人！',
      fields: [
        {
          name: '/bind',
          value: '綁定你的遊戲角色\n使用方式: `/bind username:角色名 password:密碼`'
        },
        {
          name: '/status',
          value: '查詢你綁定角色的當前狀態\n包含HP、SAN、陣營等資訊'
        },
        {
          name: '/update',
          value: '更新角色數值（設定為指定值）\n使用方式: `/update stat:HP value:85`'
        },
        {
          name: '/adjust',
          value: '調整角色數值（相對變更）\n使用方式: `/adjust stat:SAN change:-10`'
        },
        {
          name: '/history',
          value: '查看角色變更歷史\n使用方式: `/history limit:20`'
        },
        {
          name: '/roll',
          value: '擲骰判定\n使用方式: `/roll dice:1d100` (可選參數)'
        },
        {
          name: '/unbind',
          value: '解除Discord身份綁定'
        },
        {
          name: '/help',
          value: '顯示此幫助訊息'
        }
      ],
      footer: { text: 'White House TRPG Bot v2.0 - 支援數值管理' }
    };

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
};

// 事件處理
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} 已準備就緒！`);

  // 註冊斜線指令
  try {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    console.log('🔄 開始註冊斜線指令...');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ 斜線指令註冊完成 (${commands.length} 個指令)`);
  } catch (error) {
    console.error('❌ 指令註冊失敗:', error);
  }
});

// 處理斜線指令
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  
  if (commandHandlers[commandName]) {
    try {
      await commandHandlers[commandName](interaction);
    } catch (error) {
      console.error(`指令 ${commandName} 執行錯誤:`, error);
      
      try {
        const errorMessage = '❌ 指令執行時發生錯誤';
        if (interaction.deferred || interaction.replied) {
          if (!interaction.replied) {
            await interaction.editReply(errorMessage);
          }
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('回應錯誤時也發生錯誤:', replyError);
      }
    }
  }
});

// 錯誤處理
client.on('error', error => {
  console.error('Discord客戶端錯誤:', error);
});

process.on('unhandledRejection', error => {
  console.error('未處理的Promise拒絕:', error);
});

// 啟動機器人
client.login(process.env.DISCORD_TOKEN);