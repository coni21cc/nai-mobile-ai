Nai Mobile AI V1.3 更新內容

1. 對話文字縮小並移到人物下半部安全區，減少遮臉。
2. 新增動態角色狀態架構：idle / happy / caring / shy。
   目前仍是 CSS 微動；之後可直接替換成 MP4 動作片段。
3. 新增真正 AI 對話的 Netlify Function：netlify/functions/chat.mts
4. 未設定 OPENAI_API_KEY 時，自動退回 Mock 測試聊天，不會整個壞掉。

上傳：
- index.html
- style.css
- app.js
- sw.js
- netlify/functions/chat.mts  （請連同 netlify 資料夾一起上傳）

真正 AI 還需要在 Netlify 設定環境變數：
OPENAI_API_KEY = 你的 OpenAI API key
OPENAI_MODEL = 可選；預設 gpt-5.6-sol

注意：不要把 API key 寫進 GitHub 或 app.js。
