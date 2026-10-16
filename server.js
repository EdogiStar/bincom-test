const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Existing API routes
app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/lgas', require('./routes/lgaRoutes'));
app.use('/api/polling-units', require('./routes/pollingUnitRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// Get wards belonging to an LGA
app.get('/api/wards', async (req, res) => {
try {
const { lga_id } = req.query;

if (
  !lga_id ||
  !Number.isInteger(Number(lga_id)) ||
  Number(lga_id) <= 0
) {
  return res.status(400).json({
    success: false,
    message: 'A valid lga_id is required.',
  });
}

const [wards] = await db.query(
  `SELECT uniqueid, ward_id, ward_name, lga_id
   FROM ward
   WHERE lga_id = ?
   ORDER BY ward_name`,
  [Number(lga_id)]
);

return res.status(200).json({
  success: true,
  count: wards.length,
  data: wards,
});

} catch (error) {
console.error('Error fetching wards:', error.message);

return res.status(500).json({
  success: false,
  message: 'Failed to retrieve wards.',
});

}
});

// Get political parties
app.get('/api/parties', async (req, res) => {
try {
const [parties] = await db.query(
'SELECT id, partyid, partyname FROM party ORDER BY partyname'
);

return res.status(200).json({
  success: true,
  count: parties.length,
  data: parties,
});

} catch (error) {
console.error('Error fetching parties:', error.message);

return res.status(500).json({
  success: false,
  message: 'Failed to retrieve political parties.',
});

}
});

// Register a polling unit and save its results for all parties
app.post('/api/polling-units', async (req, res) => {
const {
lga_id,
ward_id,
polling_unit_number,
polling_unit_name,
results,
} = req.body;

const lgaId = Number(lga_id);
const wardUniqueId = Number(ward_id);
const unitNumber = String(polling_unit_number || '').trim();
const unitName = String(polling_unit_name || '').trim();

if (
!Number.isInteger(lgaId) ||
lgaId <= 0 ||
!Number.isInteger(wardUniqueId) ||
wardUniqueId <= 0 ||
!unitNumber ||
!unitName ||
!Array.isArray(results)
) {
return res.status(400).json({
success: false,
message:
'Please provide a valid LGA, ward, polling unit number, name, and party results.',
});
}

let connection;

try {
connection = await db.getConnection();

await connection.beginTransaction();

// The frontend sends the ward's uniqueid.
// Find the selected ward using its primary key and selected LGA.
const [wards] = await connection.query(
  `SELECT uniqueid, ward_id, lga_id
   FROM ward
   WHERE uniqueid = ? AND lga_id = ?
   LIMIT 1`,
  [wardUniqueId, lgaId]
);

if (wards.length === 0) {
  await connection.rollback();

  return res.status(400).json({
    success: false,
    message: 'The selected ward does not belong to the selected LGA.',
  });
}

const selectedWard = wards[0];

// Retrieve the registered political parties.
const [parties] = await connection.query(
  'SELECT partyid FROM party'
);

if (parties.length === 0) {
  await connection.rollback();

  return res.status(400).json({
    success: false,
    message: 'No political parties are registered.',
  });
}

// Validate one score per party.
const submitted = new Map();

for (const result of results) {
  const abbreviation = String(
    result.party_abbreviation || ''
  ).trim();

  const rawScore = result.party_score;

  if (
    abbreviation === '' ||
    rawScore === null ||
    rawScore === undefined ||
    String(rawScore).trim() === '' ||
    !Number.isInteger(Number(rawScore)) ||
    Number(rawScore) < 0 ||
    submitted.has(abbreviation)
  ) {
    await connection.rollback();

    return res.status(400).json({
      success: false,
      message:
        'Every party must have one valid, non-negative whole-number score.',
    });
  }

  submitted.set(abbreviation, Number(rawScore));
}

const expectedParties = parties.map((party) =>
  String(party.partyid).trim()
);

if (
  submitted.size !== expectedParties.length ||
  expectedParties.some((party) => !submitted.has(party))
) {
  await connection.rollback();

  return res.status(400).json({
    success: false,
    message:
      'Submit a result for every registered political party.',
  });
}

// Create the polling unit.
// ward_id stores the ward's ward_id value.
// uniquewardid stores the ward's uniqueid value.
const [insertResult] = await connection.query(
  `INSERT INTO polling_unit (
    polling_unit_id,
    ward_id,
    lga_id,
    uniquewardid,
    polling_unit_number,
    polling_unit_name,
    polling_unit_description,
    lat,
    \`long\`,
    entered_by_user,
    date_entered,
    user_ip_address
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
  [
    0,
    selectedWard.ward_id,
    lgaId,
    selectedWard.uniqueid,
    unitNumber,
    unitName,
    '',
    null,
    null,
    'admin',
    req.ip || 'unknown',
  ]
);

const pollingUnitUniqueId = insertResult.insertId;

// Save the result for every registered political party.
for (const party of parties) {
  const abbreviation = String(party.partyid).trim();

  await connection.query(
    `INSERT INTO announced_pu_results (
      polling_unit_uniqueid,
      party_abbreviation,
      party_score,
      entered_by_user,
      date_entered,
      user_ip_address
    ) VALUES (?, ?, ?, ?, NOW(), ?)`,
    [
      String(pollingUnitUniqueId),
      abbreviation,
      submitted.get(abbreviation),
      'admin',
      req.ip || 'unknown',
    ]
  );
}

await connection.commit();

return res.status(201).json({
  success: true,
  message: 'Polling unit and all party results saved successfully.',
  data: {
    uniqueid: pollingUnitUniqueId,
    lga_id: lgaId,
    ward_id: selectedWard.ward_id,
    uniquewardid: selectedWard.uniqueid,
    polling_unit_number: unitNumber,
    polling_unit_name: unitName,
    party_results_saved: parties.length,
  },
});

} catch (error) {
if (connection) {
try {
await connection.rollback();
} catch (rollbackError) {
console.error(
'Error rolling back transaction:',
rollbackError.message
);
}
}

console.error('Error creating polling unit:', error.message);

return res.status(500).json({
  success: false,
  message: 'Failed to save the polling unit and results.',
});

} finally {
if (connection) {
connection.release();
}
}
});

// API health check
app.get('/', (req, res) => {
res.json({
success: true,
message: 'Bincom Election Results API is running.',
});
});

// Handle unexpected errors
app.use((err, req, res, next) => {
console.error('Unexpected server error:', err.message);

res.status(500).json({
success: false,
message: 'An unexpected server error occurred.',
});
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
console.log(`Bincom API running on port ${PORT}`);
});

// Graceful shutdown
async function shutdown() {
server.close(async () => {
try {
await db.end();
process.exit(0);
} catch (error) {
console.error('Error closing database connection:', error.message);
process.exit(1);
}
});
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);