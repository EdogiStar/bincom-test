const db = require('../config/db');

async function getAllStates(req, res) {
  try {
    const [states] = await db.query(
      'SELECT * FROM states ORDER BY state_name ASC'
    );

    res.status(200).json({
      success: true,
      count: states.length,
      data: states,
    });
  } catch (error) {
    console.error('Error fetching states:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve states.',
    });
  }
}

module.exports = { getAllStates };
