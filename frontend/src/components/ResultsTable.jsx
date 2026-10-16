function ResultsTable({ results = [], title = 'Election Results' }) {
  const totalVotes = results.reduce(
    (total, result) => total + Number(result.party_score || 0),
    0
  )

  return (
    <section className="results-card">
      <div className="results-card-header">
        <div>
          <h3>{title}</h3>
          <p>Votes recorded for each political party</p>
        </div>

        <div className="total-votes">
          <span>Total Votes</span>
          <strong>{totalVotes.toLocaleString()}</strong>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">▤</div>
          <h4>No results available</h4>
          <p>Select a location to view its election results.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Political Party</th>
                <th>Votes</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result, index) => (
                <tr key={`${result.party_abbreviation || result.party_name}-${index}`}>
                  <td>{index + 1}</td>

                  <td>
                    <span className="party-badge">
                      {result.party_abbreviation || result.party_name}
                    </span>
                  </td>

                  <td className="vote-count">
                    {Number(result.party_score || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="2">Total Votes</td>
                <td className="vote-count">
                  {totalVotes.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}

export default ResultsTable