import { useEffect, useState } from 'react';

function LocationSelector({
  onPollingUnitChange,
  onLgaChange,
  onWardChange,
  showWard = false,
  showPollingUnit = false,
}) {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);

  const [stateId, setStateId] = useState('');
  const [lgaId, setLgaId] = useState('');
  const [wardId, setWardId] = useState('');
  const [pollingUnitId, setPollingUnitId] = useState('');

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPollingUnits, setLoadingPollingUnits] = useState(false);

  const [error, setError] = useState('');

  // Load states
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      setError('');

      try {
        const response = await fetch('/api/states');

        if (!response.ok) {
          throw new Error('Failed to load states.');
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.data || result.states || [];

        setStates(data);
      } catch (err) {
        setError(err.message || 'Unable to load states.');
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Load LGAs when a state is selected
  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      return;
    }

    const fetchLgas = async () => {
      setLoadingLgas(true);
      setError('');

      try {
        const response = await fetch(
          `/api/lgas?state_id=${encodeURIComponent(stateId)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load LGAs.');
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.data || result.lgas || [];

        setLgas(data);
      } catch (err) {
        setLgas([]);
        setError(err.message || 'Unable to load LGAs.');
      } finally {
        setLoadingLgas(false);
      }
    };

    fetchLgas();
  }, [stateId]);

  // Load wards when an LGA is selected
  useEffect(() => {
    if (!showWard || !lgaId) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      setLoadingWards(true);
      setError('');

      try {
        const response = await fetch(
          `/api/wards?lga_id=${encodeURIComponent(lgaId)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load wards.');
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.data || result.wards || [];

        setWards(data);
      } catch (err) {
        setWards([]);
        setError(err.message || 'Unable to load wards.');
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [lgaId, showWard]);

  // Load polling units when an LGA is selected
  useEffect(() => {
    if (!showPollingUnit || !lgaId) {
      setPollingUnits([]);
      return;
    }

    const fetchPollingUnits = async () => {
      setLoadingPollingUnits(true);
      setError('');

      try {
        const response = await fetch(
          `/api/polling-units?lga_id=${encodeURIComponent(lgaId)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load polling units.');
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.data ||
            result.pollingUnits ||
            result.polling_units ||
            [];

        setPollingUnits(data);
      } catch (err) {
        setPollingUnits([]);
        setError(err.message || 'Unable to load polling units.');
      } finally {
        setLoadingPollingUnits(false);
      }
    };

    fetchPollingUnits();
  }, [lgaId, showPollingUnit]);

  // Notify parent when the selected LGA changes
  useEffect(() => {
    onLgaChange?.(lgaId);
  }, [lgaId, onLgaChange]);

  // Notify parent when the selected ward changes
  useEffect(() => {
    onWardChange?.(wardId);
  }, [wardId, onWardChange]);

  // Notify parent when the selected polling unit changes
  useEffect(() => {
    onPollingUnitChange?.(pollingUnitId);
  }, [pollingUnitId, onPollingUnitChange]);

  // Handle state selection
  const handleStateChange = (event) => {
    setStateId(event.target.value);

    setLgaId('');
    setWardId('');
    setPollingUnitId('');

    setLgas([]);
    setWards([]);
    setPollingUnits([]);
    setError('');
  };

  // Handle LGA selection
  const handleLgaChange = (event) => {
    setLgaId(event.target.value);

    setWardId('');
    setPollingUnitId('');

    setWards([]);
    setPollingUnits([]);
    setError('');
  };

  // Handle ward selection
  const handleWardChange = (event) => {
    setWardId(event.target.value);
  };

  // Handle polling unit selection
  const handlePollingUnitChange = (event) => {
    setPollingUnitId(event.target.value);
  };

  return (
    <div className="location-selector">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* State */}
      <div className="form-group">
        <label htmlFor="state">State</label>

        <select
          id="state"
          value={stateId}
          onChange={handleStateChange}
          disabled={loadingStates}
        >
          <option value="">
            {loadingStates ? 'Loading states...' : 'Select State'}
          </option>

          {states.map((state) => (
            <option
              key={state.state_id}
              value={state.state_id}
            >
              {state.state_name || state.name}
            </option>
          ))}
        </select>
      </div>

      {/* Local Government Area */}
      <div className="form-group">
        <label htmlFor="lga">Local Government Area</label>

        <select
          id="lga"
          value={lgaId}
          onChange={handleLgaChange}
          disabled={!stateId || loadingLgas}
        >
          <option value="">
            {!stateId
              ? 'Select a state first'
              : loadingLgas
                ? 'Loading LGAs...'
                : 'Select LGA'}
          </option>

          {lgas.map((lga) => (
            <option
              key={lga.lga_id}
              value={lga.lga_id}
            >
              {lga.lga_name || lga.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ward */}
      {showWard && (
        <div className="form-group">
          <label htmlFor="ward">Ward</label>

          <select
            id="ward"
            value={wardId}
            onChange={handleWardChange}
            disabled={!lgaId || loadingWards}
          >
            <option value="">
              {!lgaId
                ? 'Select an LGA first'
                : loadingWards
                  ? 'Loading wards...'
                  : 'Select Ward'}
            </option>

            {wards.map((ward) => (
              <option
                key={ward.uniqueid}
                value={ward.uniqueid}
              >
                {ward.ward_name || `Ward ${ward.uniqueid}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Polling Unit */}
      {showPollingUnit && (
        <div className="form-group">
          <label htmlFor="pollingUnit">Polling Unit</label>

          <select
            id="pollingUnit"
            value={pollingUnitId}
            onChange={handlePollingUnitChange}
            disabled={!lgaId || loadingPollingUnits}
          >
            <option value="">
              {!lgaId
                ? 'Select an LGA first'
                : loadingPollingUnits
                  ? 'Loading polling units...'
                  : 'Select Polling Unit'}
            </option>

            {pollingUnits.map((unit) => (
              <option
                key={unit.uniqueid}
                value={unit.uniqueid}
              >
                {unit.polling_unit_name ||
                  unit.polling_unit_number ||
                  unit.number ||
                  `Polling Unit ${unit.uniqueid}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;