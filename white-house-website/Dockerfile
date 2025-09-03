# 使用官方 Node.js 運行環境
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴（包含開發依賴，建置時需要）
RUN npm ci

# 複製應用程式碼
COPY . .

# 建置 Next.js 應用
RUN npm run build

# 移除開發依賴（減少映像大小）
RUN npm prune --only=production

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]