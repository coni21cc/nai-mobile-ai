Nai Mobile AI V1.1 更新檔

請用這 4 個檔案覆蓋 GitHub repo 根目錄的同名檔案：
- index.html
- style.css
- app.js
- sw.js

主要修正：
1. iPhone 直式構圖：前景圖片改為 contain，背景用同圖模糊填滿，人物不再只剩頭部。
2. 對話輸入列上移，避開 Netlify badge。
3. 送出按鈕明顯化，支援 Enter / iPhone Send。
4. 增加使用者訊息顯示與測試回覆。
5. Service Worker 升級 cache 版本，避免手機一直看到舊版。

GitHub 更新後 Netlify 會自動部署。
