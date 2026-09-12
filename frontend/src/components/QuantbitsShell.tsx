import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "⌂" },
  { to: "/courses", label: "My learning", icon: "◫" },
  { to: "/quantum-lab", label: "Quantum Lab", icon: "⌁" },
  { to: "/experiments", label: "Experiments", icon: "◈" },
  { to: "/progress", label: "Progress", icon: "↗" },
];

export default function QuantbitsShell() {
  const location = useLocation();
  const labMode = location.pathname === "/quantum-lab";
  return <div className={`quantbits-app ${labMode ? "lab-mode" : ""}`}>
    <aside className="side-nav">
      <NavLink className="qb-brand" to="/"><span className="qb-mark">Q</span><span><strong>QUANTBITS</strong><small>quantum learning platform</small></span></NavLink>
      <div className="side-section-label">LEARNING SPACE</div>
      <nav className="side-links">{navItems.map((item) => <NavLink className={({ isActive }) => isActive ? "side-link active" : "side-link"} key={item.to} to={item.to}><span className="side-icon">{item.icon}</span>{item.label}</NavLink>)}</nav>
      <div className="side-section-label">YOUR PATH</div>
      <NavLink className="path-mini" to="/courses/fundamentals"><span className="path-orb">72</span><span><strong>Quantum foundations</strong><small>3 lessons remaining</small></span><b>›</b></NavLink>
      <div className="side-spacer" />
      <NavLink className="qb-bot-link" to="/ai-tutor"><span>✦</span><span><strong>Ask Q-BOT</strong><small>Your quantum co-pilot</small></span></NavLink>
      <div className="user-mini"><span className="avatar">AK</span><span><strong>Ankush Kumar</strong><small>Explorer · level 04</small></span><b>•••</b></div>
    </aside>
    <div className="content-shell">
      <header className="app-topbar"><div className="crumbs"><span>QUANTBITS</span><b>/</b><strong>{labMode ? "Quantum Lab" : "Learning space"}</strong></div><div className="top-actions"><button className="icon-button" title="Search" type="button">⌕</button><button className="icon-button" title="Notifications" type="button">◌</button><span className="top-divider" /><span className="streak">✦ 7 day streak</span></div></header>
      <main className="route-content"><Outlet /></main>
    </div>
  </div>;
}
