function Sidebar({ page, setPage }) {
  const menuItems = [
    {
      id: 'polling',
      label: 'Polling Unit Results',
      icon: '▤',
    },
    {
      id: 'lga',
      label: 'LGA Results',
      icon: '▥',
    },
    {
      id: 'add',
      label: 'Register Polling Unit',
      icon: '+',
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">B</div>

        <div>
          <h2>BINCOM</h2>
          <span>Election Portal</span>
        </div>
      </div>

      <div className="sidebar-section-label">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${
              page === item.id ? 'active' : ''
            }`}
            onClick={() => setPage(item.id)}
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-icon">✓</div>

        <div>
          <strong>System Online</strong>
          <span>Election database connected</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar