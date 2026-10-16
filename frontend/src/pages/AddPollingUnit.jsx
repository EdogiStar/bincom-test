import { useEffect, useState } from 'react'
import LocationSelector from '../components/LocationSelector'

function AddPollingUnit() {
const [parties, setParties] = useState([])
const [partyVotes, setPartyVotes] = useState({})
const [pollingUnitName, setPollingUnitName] = useState('')
const [pollingUnitNumber, setPollingUnitNumber] = useState('')
const [lgaId, setLgaId] = useState('')
const [wardId, setWardId] = useState('')
const [message, setMessage] = useState('')
const [messageType, setMessageType] = useState('success')
const [loadingParties, setLoadingParties] = useState(true)
const [saving, setSaving] = useState(false)

useEffect(() => {
async function loadParties() {
try {
setLoadingParties(true)

    const response = await fetch('/api/parties')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load political parties.')
    }

    const list = Array.isArray(data)
      ? data
      : data.data || data.parties || []

    if (list.length === 0) {
      throw new Error('No political parties were returned by the server.')
    }

    setParties(list)

    const initialVotes = {}

    list.forEach((party) => {
      initialVotes[party.partyid] = ''
    })

    setPartyVotes(initialVotes)
  } catch (error) {
    setMessage(error.message || 'Could not load political parties.')
    setMessageType('error')
  } finally {
    setLoadingParties(false)
  }
}

loadParties()

}, [])

function updateVotes(partyId, value) {
setPartyVotes((current) => ({
...current,
[partyId]: value,
}))
}

async function handleSubmit(event) {
event.preventDefault()

if (saving) return

setMessage('')
setMessageType('error')

if (!lgaId) {
  setMessage('Please select a state and LGA.')
  return
}

if (!wardId) {
  setMessage('Please select a ward.')
  return
}

if (!pollingUnitName.trim() || !pollingUnitNumber.trim()) {
  setMessage('Please enter the polling unit name and number.')
  return
}

if (parties.length === 0) {
  setMessage('Political parties are not available. Please reload the page.')
  return
}

const results = []

for (const party of parties) {
  const partyId = party.partyid
  const rawScore = partyVotes[partyId]

  if (
    rawScore === undefined ||
    String(rawScore).trim() === '' ||
    !Number.isInteger(Number(rawScore)) ||
    Number(rawScore) < 0
  ) {
    setMessage(
      `Please enter a valid, non-negative whole-number vote count for ${
        party.partyname || partyId
      }.`
    )
    return
  }

  results.push({
    party_abbreviation: String(partyId).trim(),
    party_score: Number(rawScore),
  })
}

const confirmed = window.confirm(
  'Submit this polling unit and its results for all political parties?'
)

if (!confirmed) return

setSaving(true)

try {
  const response = await fetch('/api/polling-units', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lga_id: Number(lgaId),
      ward_id: Number(wardId),
      polling_unit_number: pollingUnitNumber.trim(),
      polling_unit_name: pollingUnitName.trim(),
      results,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Failed to register the polling unit.'
    )
  }

  setMessage(
    `${data.message} Polling Unit ID: ${data.data?.uniqueid ?? 'saved'}. Party results saved: ${data.data?.party_results_saved ?? results.length}.`
  )
  setMessageType('success')

  setPollingUnitName('')
  setPollingUnitNumber('')

  const clearedVotes = {}

  parties.forEach((party) => {
    clearedVotes[party.partyid] = ''
  })

  setPartyVotes(clearedVotes)
} catch (error) {
  setMessage(
    error.message ||
      'Could not submit the polling unit. Please check your connection and try again.'
  )
  setMessageType('error')
} finally {
  setSaving(false)
}

}

return (
<div className="page-content">
<section className="content-card">
<div className="section-heading">
<div>
<span className="section-kicker">
POLLING UNIT MANAGEMENT
</span>

        <h3>Register a Polling Unit</h3>

        <p>
          Select the location, enter the polling unit details, and record
          the votes for each political party.
        </p>
      </div>
    </div>

    <form onSubmit={handleSubmit}>
      <LocationSelector
        showWard
        onLgaChange={setLgaId}
        onWardChange={setWardId}
      />

      <div className="form-grid polling-unit-fields">
        <label className="form-field">
          <span>Polling Unit Name</span>

          <input
            type="text"
            value={pollingUnitName}
            onChange={(event) =>
              setPollingUnitName(event.target.value)
            }
            placeholder="Enter polling unit name"
            maxLength={50}
            required
          />
        </label>

        <label className="form-field">
          <span>Polling Unit Number</span>

          <input
            type="text"
            value={pollingUnitNumber}
            onChange={(event) =>
              setPollingUnitNumber(event.target.value)
            }
            placeholder="Enter polling unit number"
            maxLength={50}
            required
          />
        </label>
      </div>

      <div className="party-votes-section">
        <div className="section-heading">
          <div>
            <h3>Party Results</h3>

            <p>
              Enter the votes recorded for each political party.
            </p>
          </div>
        </div>

        {loadingParties ? (
          <p className="form-status">
            Loading political parties...
          </p>
        ) : parties.length === 0 ? (
          <p className="form-error">
            Political parties could not be loaded. Please reload the page.
          </p>
        ) : (
          <div className="form-grid">
            {parties.map((party) => {
              const partyId = party.partyid
              const partyName =
                party.partyname ||
                party.partyabbreviation ||
                party.party_name ||
                party.party_abbreviation ||
                `Party ${partyId}`

              return (
                <label className="form-field" key={partyId}>
                  <span>{partyName}</span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={partyVotes[partyId] ?? ''}
                    onChange={(event) =>
                      updateVotes(partyId, event.target.value)
                    }
                    placeholder="Enter votes"
                    required
                  />
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={saving || loadingParties || parties.length === 0}
        >
          {saving ? 'Saving Polling Unit...' : 'Register Polling Unit'}
        </button>
      </div>

      {message && (
        <p
          className={
            messageType === 'error'
              ? 'form-error'
              : 'form-status'
          }
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  </section>
</div>

)
}

export default AddPollingUnit