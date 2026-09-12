import { NavLink, Outlet, useLocation } from "react-router-dom";
import GlobalChat from "./GlobalChat";

const navItems = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/courses", label: "Courses", icon: "◫" },
  { to: "/docs", label: "Docs", icon: "▤" },
  { to: "/my-learning", label: "My Learning", icon: "↗" },
];

export default function QuantbitsShell() {
  const location = useLocation();
  const playerMode = location.pathname.includes("/learn");
  return <div className={`quantbits-app ${playerMode ? "player-mode" : ""}`}>
    <aside className="side-nav">
      <NavLink className="qb-brand" to="/"><span className="qb-mark">Q</span><span><strong>Q LEARN</strong><small>quantum learning platform</small></span></NavLink>
      <div className="side-section-label">LEARNING SPACE</div>
      <nav className="side-links">{navItems.map((item) => <NavLink className={({ isActive }) => isActive ? "side-link active" : "side-link"} key={item.to} to={item.to}><span className="side-icon">{item.icon}</span>{item.label}</NavLink>)}</nav>
      <div className="side-section-label">YOUR PATH</div>
      <NavLink className="path-mini" to="/courses/fundamentals/learn"><span className="path-orb">72</span><span><strong>Quantum foundations</strong><small>3 lessons remaining</small></span><b>›</b></NavLink>
      <div className="side-spacer" />
      <div className="qb-bot-link"><span>✦</span><span><strong>Ask Q-BOT</strong><small>Your quantum co-pilot</small></span></div>
      <div className="user-mini"><span className="avatar">AK</span><span><strong>Ankush Kumar</strong><small>Explorer · level 04</small></span><b>•••</b></div>
    </aside>
    <div className="content-shell">
      <header className="app-topbar"><div className="crumbs"><NavLink className="home-control" title="Go home" to="/">⌂ <span>Home</span></NavLink><b>/</b><strong>{playerMode ? "Course player" : "Learning space"}</strong></div><div className="top-actions"><button className="icon-button" title="Search" type="button">⌕</button><button className="icon-button" title="Notifications" type="button">◌</button><span className="top-divider" /><span className="streak">✦ 7 day streak</span></div></header>
      <main className="route-content"><Outlet /></main>
    </div>
    {!playerMode && <GlobalChat />}
  </div>;
}
