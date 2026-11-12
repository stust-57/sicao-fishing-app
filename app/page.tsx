 "use client";
import { useEffect, useState } from "react";

type Weather = { location?: string; description?: string; temperature?: string; wind?: string; humidity?: string; updatedAt?: string; error?: string };
type Tide = {
  location: string;
  date: string;
  dateTime: string;
  tide: string;
  height: number | string;
  range?: string;
};
const fish = [
  ["黑鯛","底棲魚","沉底、前打","南極蝦、蚵肉"],
  ["黃鰭鯛","底棲魚","沉底釣法","蝦仁、蚵肉"],
  ["鱸魚","洄游魚","路亞、活餌","米諾、軟蟲、小魚"],
  ["豆仔魚","洄游魚","浮游磯釣","麵餌、南極蝦"],
  ["虱目魚","洄游魚","浮標、沉底","麵餌、藻類"]
];
export default function Home() {
  const [tab,setTab] = useState("總覽");
  const [weather,setWeather] = useState<Weather|null>(null);
  const [tides,setTides] = useState<Tide[]>([]);
  const [loading,setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [query,setQuery] = useState("");
  const [logs,setLogs] = useState<{species:string;length:string;note:string;date:string}[]>([]);
  const [reports,setReports] = useState<{species:string;place:string;note:string;date:string}[]>([]);
  const [species,setSpecies] = useState("黑鯛");
  const [length,setLength] = useState("");
  const [note,setNote] = useState("");
  const [biteSpecies,setBiteSpecies] = useState("黑鯛");
  const [place,setPlace] = useState("四草大橋周邊");
  const [bite,setBite] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/cwa", { cache: "no-store" });
      const data = await res.json();
      setWeather(data.weather ?? null);
      setTides(data.tides ?? []);
    } catch {
      setWeather({error:"目前無法取得氣象資料，請稍後再試。"});
    } finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); },[]);
  useEffect(() => {
  const timer = setInterval(() => {
    setNow(Date.now());
  }, 60000);

  return () => clearInterval(timer);
}, []);
  useEffect(() => {
  const timer = setInterval(() => {
    setNow(Date.now());
  }, 60000);

  return () => clearInterval(timer);
}, []);
  function addLog(e:React.FormEvent) {
    e.preventDefault();
    if (!length || Number(length)<=0) return;
    setLogs([{species,length,note,date:new Date().toLocaleString("zh-TW")},...logs]);
    setLength(""); setNote("");
  }
  function addReport(e:React.FormEvent) {
    e.preventDefault();
    if (!bite.trim() || !place.trim()) return;
    setReports([{species:biteSpecies,place,note:bite,date:new Date().toLocaleString("zh-TW")},...reports]);
    setBite("");
  }
  const tabs = ["總覽","魚種","釣點","紀錄","咬況"];
  const nextTide = tides
  .filter(t => new Date(t.dateTime).getTime() > now)
  .sort(
    (a, b) =>
      new Date(a.dateTime).getTime() -
      new Date(b.dateTime).getTime()
  )[0];
  return <main className="shell">
    <header className="top"><div><div className="eyebrow">TAINAN · TAIWAN · FISHING</div><h1>🌊 四草釣魚情報站</h1><p>潮汐、天氣、魚訊與漁獲紀錄</p></div><span className="status">前端測試版</span></header>
    <section className="hero"><div className="hero-copy"><span>WELCOME TO SICAO</span><h2>今天，準備好出竿了嗎？</h2><p>掌握潮汐變化，留意風浪，安全享受釣魚。</p></div></section>
    <nav className="tabs">{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</nav>
    {tab==="總覽" && <section className="content">
      <div className="section-head"><h2>今日釣況總覽</h2><button className="secondary" onClick={refresh}>{loading?"更新中…":"↻ 更新資料"}</button></div>
      <div className="cards">
        <article className="panel"><div className="panel-label">🌤 臺南天氣</div><strong>{weather?.temperature ?? "--"}{weather?.temperature?"°C":""}</strong><p>{weather?.description ?? weather?.error ?? "讀取氣象資料中"}</p><small>{weather?.wind ?? "風況待取得"}　{weather?.humidity ?? ""}</small></article>
        <article className="panel"><div className="panel-label">🌊 潮汐預報</div><strong>{tides.length ? `${tides.length} 筆` : "--"}</strong><p>四草鄰近預報測站</p><small>資料依官方測站位置呈現</small></article>
      </div>
      <article className="panel">
  <div className="panel-label">🎣 下一次潮汐</div>

  {nextTide ? (
    <>
      <strong>
        {nextTide.tide === "滿潮" ? "🌊 即將滿潮" : "🌊 即將乾潮"}
      </strong>

      <h2>
        {new Date(nextTide.dateTime).toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })}
      </h2>

      <p>潮高：{nextTide.height} cm</p>
      <small>{nextTide.location}</small>
    </>
  ) : (
    <p className="muted">目前沒有即將到來的潮汐資料</p>
  )}
</article>
      <article className="panel">
  <h3>🌊 安南區近期滿潮／乾潮</h3>

  {tides.length ? (
    <div className="tide-list">
      {tides.slice(0, 8).map((t, i) => (
        <div key={i}>
          <b>{t.tide}</b>
          <span>
            {new Date(t.dateTime).toLocaleString("zh-TW", {
              timeZone: "Asia/Taipei",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })}
          </span>
          <span>{t.height} cm</span>
          <small>{t.location} · {t.range ?? "潮差資料未提供"}</small>
        </div>
      ))}
    </div>
  ) : (
    <p className="muted">
      尚無潮汐資料，請稍後重新更新。
    </p>
  )}
</article>
      <article className="panel"><h3>出釣安全提醒</h3><ul><li>出發前確認風浪、降雨及海象警示。</li><li>穿著救生衣、防滑鞋，避免獨自前往危險岸段。</li><li>避開橋面、航道、公告禁釣區及私人土地。</li></ul></article>
      <p className="muted footnote">氣象資料由中央氣象署 API 提供；預報測站不等於四草橋下的實際水流或浪況。</p>
    </section>}
    {tab==="魚種" && <section className="content"><h2>魚種資料庫</h2><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜尋魚種名稱"/>{fish.filter(f=>f.join(" ").toLowerCase().includes(query.toLowerCase())).map(f=><article className="panel fish" key={f[0]}><div><h3>{f[0]}</h3><span className="tag">{f[1]}</span></div><p>推薦釣法：{f[2]}</p><small>參考餌料：{f[3]}</small></article>)}</section>}
    {tab==="釣點" && <section className="content"><h2>四草周邊釣點地圖</h2><article className="panel"><p>地圖定位示意：台南四草大橋周邊</p><div className="map"><iframe title="四草大橋地圖" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=120.12%2C23.00%2C120.18%2C23.06&layer=mapnik&marker=23.028%2C120.15"></iframe></div><a className="map-link" href="https://www.openstreetmap.org/?mlat=23.028&mlon=120.15#map=14/23.028/120.15" target="_blank" rel="noreferrer">在 OpenStreetMap 開啟地圖 ↗</a><p className="warning">地圖標記僅為區域參考，不代表合法釣點。請先確認現場公告、土地權屬、航道與禁制規定。</p></article></section>}
    {tab==="紀錄" && <section className="content"><h2>我的釣魚紀錄</h2><form className="panel form" onSubmit={addLog}><label>魚種<select value={species} onChange={e=>setSpecies(e.target.value)}>{fish.map(f=><option key={f[0]}>{f[0]}</option>)}<option>其他</option></select></label><label>魚體長度（公分）<input type="number" min="0.1" step="0.1" required value={length} onChange={e=>setLength(e.target.value)} placeholder="例如 25"/></label><label>備註<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="釣點、釣法、餌料…"/></label><button className="primary">新增紀錄</button></form>{logs.map((l,i)=><article className="panel" key={i}><div className="row"><h3>{l.species} · {l.length} cm</h3><button className="delete" onClick={()=>setLogs(logs.filter((_,j)=>i!==j))}>刪除</button></div><small>{l.date}</small><p>{l.note||"無備註"}</p></article>)}<p className="muted">此版本紀錄暫存於目前頁面；接上資料庫後才會跨裝置保存。</p></section>}
    {tab==="咬況" && <section className="content"><h2>即時咬況回報</h2><form className="panel form" onSubmit={addReport}><label>魚種<select value={biteSpecies} onChange={e=>setBiteSpecies(e.target.value)}>{fish.map(f=><option key={f[0]}>{f[0]}</option>)}<option>其他</option></select></label><label>位置<input value={place} onChange={e=>setPlace(e.target.value)}/></label><label>現場釣況<textarea required value={bite} onChange={e=>setBite(e.target.value)} placeholder="魚訊、潮水、餌料、時間…"/></label><button className="primary">發布回報</button></form><h3>最新回報</h3>{reports.map((r,i)=><article className="panel" key={i}><div className="row"><h3>{r.species}</h3><span className="tag">本機回報</span></div><small>{r.place} · {r.date}</small><p>{r.note}</p></article>)}{!reports.length&&<p className="muted">目前尚無回報。正式版將加入帳號驗證與跨使用者即時同步。</p>}</section>}
    <footer>四草大橋釣魚情報站 · Prototype · 資料請以主管機關公告為準</footer>
  </main>;
}