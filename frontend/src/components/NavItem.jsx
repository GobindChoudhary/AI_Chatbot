const NavItem = ({
  icon,
  label,
  onClick,
  active = false,
  collapsed = false,
  isMobile = false,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-2 rounded-lg transition-colors text-left hover:bg-[var(--hover)] ${
      active ? "bg-[var(--hover)]" : ""
    } ${collapsed && !isMobile ? "justify-center" : "gap-3"}`}
    title={collapsed && !isMobile ? label : undefined}
  >
    <span className="text-[var(--accent)] flex-shrink-0">{icon}</span>
    {(!collapsed || isMobile) && (
      <span className="text-sm text-[var(--text)] truncate">{label}</span>
    )}
  </button>
);

export default NavItem;
