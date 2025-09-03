/**
 * 工具函數集合
 */

/**
 * 生成唯一會話ID
 */
export function generateSessionId(prefix = 'session') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 格式化日期時間
 */
export function formatDateTime(date = new Date()) {
  return date.toISOString().split('T')[0] + ' ' + 
         date.toTimeString().split(' ')[0];
}

/**
 * 深拷貝物件
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 驗證電子郵件格式
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 隨機字串生成器
 */
export function randomString(length = 8, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 等待指定時間 (毫秒)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 限制並行數量的 Promise 執行器
 */
export async function executeWithConcurrencyLimit(tasks, limit = 3) {
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = task().then(result => ({ index, result }));
    results.push(promise);
    
    if (results.length >= limit) {
      executing.push(promise);
    }
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  const allResults = await Promise.all(results);
  return allResults.sort((a, b) => a.index - b.index).map(r => r.result);
}