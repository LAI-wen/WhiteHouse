/**
 * 標準化Google Sheets工作表範圍常數
 * 自動生成，請勿手動修改
 * 生成時間: 2025-09-03T05:00:17.998Z
 */

export const SHEET_RANGES = {
  CHARACTERS: 'Characters!A:Z',
  EVENTCAMPAIGNS: 'EventCampaigns!A:G',
  EVENTS: 'Events!A:G',
  EVENTOPTIONS: 'EventOptions!A:K',
  EVENTOUTCOMES: 'EventOutcomes!A:G',
  CAMPAIGNPROGRESS: 'CampaignProgress!A:J',
  PLAYERCHOICEHISTORY: 'PlayerChoiceHistory!A:I',
  ITEMS: 'Items!A:G',
  INVENTORY: 'Inventory!A:H',
  CAMPAIGNSESSIONS: 'CampaignSessions!A:I',
  CHARACTERCHANGELOG: 'CharacterChangelog!A:H',
  PLAYERS: 'Players!A:H',
  QUESTS: 'Quests!A:G',
  ANNOUNCEMENTS: 'Announcements!A:F',
  FAQ: 'FAQ!A:D'
};

// 工作表名稱常數
export const SHEET_NAMES = {
  CHARACTERS: 'Characters',
  EVENTCAMPAIGNS: 'EventCampaigns',
  EVENTS: 'Events',
  EVENTOPTIONS: 'EventOptions',
  EVENTOUTCOMES: 'EventOutcomes',
  CAMPAIGNPROGRESS: 'CampaignProgress',
  PLAYERCHOICEHISTORY: 'PlayerChoiceHistory',
  ITEMS: 'Items',
  INVENTORY: 'Inventory',
  CAMPAIGNSESSIONS: 'CampaignSessions',
  CHARACTERCHANGELOG: 'CharacterChangelog',
  PLAYERS: 'Players',
  QUESTS: 'Quests',
  ANNOUNCEMENTS: 'Announcements',
  FAQ: 'FAQ'
};

// 標準欄位定義
export const SHEET_HEADERS = {
  CHARACTERS: ["Character_ID","Player_Discord_ID","Character_Name","Username","Password","Public_Faction","True_Faction","HP","Max_HP","SAN","Max_SAN","AP","BP","STR","CON","DEX","APP","INT","LUCK","Good_Boy_Points","Performance_Points","Background_Story","Personal_Notes","Last_Active","Created_Date","Updated_Date"],
  EVENTCAMPAIGNS: ["Campaign_ID","Campaign_Name","Campaign_Description","Allowed_Factions","Allowed_Characters","Is_Available","Created_Date"],
  EVENTS: ["Step_ID","Campaign_ID","Step_Title","Step_Description","Image_URL","Is_Starting_Step","Created_Date"],
  EVENTOPTIONS: ["Option_ID","Source_Step_ID","Target_Step_ID","Option_Text","Req_Stat_Name","Req_Stat_Operator","Req_Stat_Value","Req_Item_ID","Requirement_Text","Is_Available","Max_Uses_Per_Player"],
  EVENTOUTCOMES: ["Outcome_ID","Trigger_Option_ID","Outcome_Type","Outcome_Target","Outcome_Value","Outcome_Description","Discord_Message"],
  CAMPAIGNPROGRESS: ["Progress_ID","Character_ID","Campaign_ID","Session_ID","Current_Step_ID","Started_At","Last_Updated","Version","Status","Completion_Rate"],
  PLAYERCHOICEHISTORY: ["Choice_ID","Character_ID","Campaign_ID","Session_ID","Step_ID","Option_ID","Choice_Result","Timestamp","Previous_Choice_ID"],
  ITEMS: ["Item_ID","Item_Name","Item_Description","Item_Type","Item_Value","Is_Consumable","Created_Date"],
  INVENTORY: ["Character_ID","Item_ID","Quantity","Obtained_Date","Obtained_Method","Notes","Last_Used","Updated_Date"],
  CAMPAIGNSESSIONS: ["Session_ID","Campaign_ID","Started_At","Ended_At","Duration_MS","Total_Players","Total_Actions","End_Reason","Session_Stats"],
  CHARACTERCHANGELOG: ["Change_ID","Character_ID","Change_Type","Target_Field","Old_Value","New_Value","Timestamp","Source"],
  PLAYERS: ["Player_ID","Discord_ID","Discord_Name","Join_Date","Status","Notes","Last_Active","Permission_Level"],
  QUESTS: ["Quest_ID","Quest_Title","Quest_Description","Quest_Reward","Is_Active","Created_Date","Completion_Count"],
  ANNOUNCEMENTS: ["Announcement_ID","Title","Content","Author","Created_Date","Is_Active"],
  FAQ: ["FAQ_ID","Question","Answer","Created_Date"]
};

// 輔助函數
export function getSheetRange(sheetName) {
  const upperName = sheetName.toUpperCase();
  return SHEET_RANGES[upperName] || `${sheetName}!A:Z`;
}

export function getSheetHeaders(sheetName) {
  const upperName = sheetName.toUpperCase();
  return SHEET_HEADERS[upperName] || [];
}
