# 四草大橋釣魚情報站（第二階段開發底稿）

Next.js 14 + TypeScript，適合部署到 Vercel。包含：
- 深色海洋風響應式首頁
- 中央氣象署 API 伺服器端代理（API Key 不暴露在瀏覽器）
- 臺南 3 天天氣資料集 `F-D0047-077`
- 未來 1 個月潮汐資料集 `F-A0021-001`
- 魚種查詢、釣點地圖、前端漁獲紀錄與咬況回報原型

## 本機啟動
1. 安裝 Node.js 20 或更新版本。
2. 複製 `.env.example` 為 `.env.local`。
3. 在 `.env.local` 設定 `CWA_API_KEY=你的授權碼`。
4. 執行 `npm install`，再執行 `npm run dev`。
5. 開啟 http://localhost:3000 。

若尚未取得 API Key，網站仍可開啟，但氣象及潮汐卡片會顯示未設定狀態。

## 申請 CWA API Key
1. 前往 https://opendata.cwa.gov.tw/ 註冊並登入會員。
2. 到會員資料／授權碼頁面取得 API 授權碼。
3. 將授權碼存入部署平台的伺服器環境變數 `CWA_API_KEY`，不要加上 `NEXT_PUBLIC_` 前綴。
4. 重新部署。

## Vercel 公開部署
1. 將此專案解壓縮後，推送到自己的 GitHub repository。
2. 登入 https://vercel.com/ ，選擇 Add New → Project，匯入該 repository。
3. Framework 選 Next.js，Build Command 使用 `npm run build`。
4. 在 Project Settings → Environment Variables 新增 `CWA_API_KEY`，套用 Production（也可加 Preview）。
5. Deploy。完成後 Vercel 會提供公開 HTTPS 網址，可用手機開啟。

## 重要限制與下一階段
- CWA 潮汐資料的實際欄位結構與地點名稱，需以授權後回傳 JSON 核對；不同測站不應冒充四草橋現場潮位。
- 目前釣魚紀錄及咬況僅存在瀏覽器頁面狀態，尚未跨裝置同步。
- 上線前應加入 Supabase（或同級資料庫）、登入、照片儲存、回報防濫用與資料刪除功能。
- 地圖目前是區域示意，不代表合法垂釣點；需另行核實禁釣區、航道與安全範圍。
- 上線前請測試 API 配額、快取、錯誤處理與 CWA 授權條款。
