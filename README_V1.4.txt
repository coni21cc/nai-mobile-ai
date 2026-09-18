# Nai Mobile AI V1.4 更新

這一版先不處理 API key，重點放在手機互動與動態架構：

- 對話文字更小、位置更低，避免遮住人物頭部
- 點角色會有隨機反應
- 待機時會隨機切換 look / happy / shy / near 微動狀態
- 主動聊天：長時間沒互動時會偶爾主動說一句
- iPhone 鍵盤高度偵測，輸入框與對話區會跟著上移
- 換裝改成獨立素材插槽
- 動態影片改成獨立 MP4 插槽；有檔案時自動優先播放，沒有就使用 CSS 微動

## 可選素材路徑

服裝圖片：
- assets/outfits/home.jpg
- assets/outfits/sleep.jpg
- assets/outfits/out.jpg
- assets/outfits/school.jpg
- assets/outfits/casual.jpg

動作影片：
- assets/motions/idle.mp4
- assets/motions/happy.mp4
- assets/motions/caring.mp4
- assets/motions/shy.mp4
- assets/motions/look.mp4
- assets/motions/near.mp4

目前不需要先放這些素材，程式會自動 fallback 到現有示範圖與 CSS 微動。
