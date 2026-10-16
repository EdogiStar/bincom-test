import { useEffect, useState } from 'react'
import LocationSelector from '../components/LocationSelector'
import ResultsTable from '../components/ResultsTable'

function PollingUnitResults() {
  const [pollingUnitId, setPollingUnitId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!pollingUnitId) {
      setResults([])
      setError('')
      return
    }

    async function loadResults() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `/api/results/polling-unit/${encodeURIComponent(pollingUnitId)}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load polling unit results.'
          )
        }

        setResults(
          Array.isArray(data) ? data : data.results || data.data || []
        )
      } catch (err) {
        setResults([])
        setError(err.message || 'Failed to load polling unit results.')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [pollingUnitId])

  return (
    <div className="page-content">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RESULTS EXPLORER</span>
            <h3>Find Polling Unit Results</h3>
            <p>
              Select a state, LGA, and polling unit to view recorded votes.
            </p>
          </div>
        </div>

        <LocationSelector
          showPollingUnit
          onPollingUnitChange={setPollingUnitId}
        />
      </section>

      {loading && (
        <div className="content-card">
          <p className="form-status">Loading election results...</p>
        </div>
      )}

      {error && (
        <div className="content-card">
          <p className="form-error">{error}</p>
        </div>
      )}

      {!loading && !error && pollingUnitId && (
        <ResultsTable
          title="Polling Unit Election Results"
          results={results}
        />
      )}
    </div>
  )
}

export default PollingUnitResults