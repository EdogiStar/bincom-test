import { useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar'
import PollingUnitResults from './pages/PollingUnitResults'
import LgaResults from './pages/LgaResults'
import AddPollingUnit from './pages/AddPollingUnit'

function App() {
  const [page, setPage] = useState('polling')

  const pages = {
    polling: {
      title: 'Polling Unit Results',
      subtitle: 'Explore individual polling unit results.',
    },
    lga: {
      title: 'LGA Results',
      subtitle: 'Explore aggregated election results by LGA.',
    },
    add: {
      title: 'Register Polling Unit',
      subtitle: 'Add a polling unit and record party results.',
    },
  }

  const currentPage = pages[page]

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">ELECTION MANAGEMENT</span>
            <h1>{currentPage.title}</h1>
          </div>

          <div className="topbar-badge">
            <span className="status-dot" />
            Election Database
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <span className="welcome-label">
              BINCOM ELECTION RESULTS
            </span>

            <h2>{currentPage.title}</h2>
            <p>{currentPage.subtitle}</p>
          </div>

          <div className="welcome-symbol">▥</div>
        </section>

        {page === 'polling' && <PollingUnitResults />}
        {page === 'lga' && <LgaResults />}
        {page === 'add' && <AddPollingUnit />}

        <footer className="footer">
          <span>BINCOM ELECTION DATA PORTAL</span>
          <span>Election results made accessible</span>
        </footer>
      </main>
    </div>
  )
}

export default App