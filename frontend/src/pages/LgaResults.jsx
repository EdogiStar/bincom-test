import { useEffect, useState } from 'react'
import LocationSelector from '../components/LocationSelector'
import ResultsTable from '../components/ResultsTable'

function LgaResults() {
  const [lgaId, setLgaId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!lgaId) {
      setResults([])
      setError('')
      return
    }

    async function loadResults() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `/api/results/lga/${encodeURIComponent(lgaId)}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load LGA results.'
          )
        }

        setResults(
          Array.isArray(data) ? data : data.results || data.data || []
        )
      } catch (err) {
        setResults([])
        setError(err.message || 'Failed to load LGA results.')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [lgaId])

  return (
    <div className="page-content">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">AGGREGATED RESULTS</span>
            <h3>Find LGA Election Results</h3>
            <p>
              Select a state and LGA to view combined votes from its polling units.
            </p>
          </div>
        </div>

        <LocationSelector onLgaChange={setLgaId} />
      </section>

      {loading && (
        <div className="content-card">
          <p className="form-status">Calculating aggregated results...</p>
        </div>
      )}

      {error && (
        <div className="content-card">
          <p className="form-error">{error}</p>
        </div>
      )}

      {!loading && !error && lgaId && (
        <ResultsTable
          title="LGA Aggregated Election Results"
          results={results}
        />
      )}
    </div>
  )
}

export default LgaResults