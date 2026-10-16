const db = require('../config/db');

async function getAllLgas(req, res) {
  try {
    const { state_id } = req.query;

    let sql = `
      SELECT
        uniqueid,
        lga_id,
        lga_name,
        state_id
      FROM lga
    `;

    const params = [];

    if (state_id !== undefined) {
      const parsedStateId = Number(state_id);

      if (!Number.isInteger(parsedStateId) || parsedStateId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'state_id must be a positive integer.',
        });
      }

      sql += ' WHERE state_id = ?';
      params.push(parsedStateId);
    }

    sql += ' ORDER BY lga_name ASC';

    const [lgas] = await db.query(sql, params);

    res.status(200).json({
      success: true,
      count: lgas.length,
      data: lgas,
    });
  } catch (error) {
    console.error('Error fetching LGAs:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve LGAs.',
    });
  }
}

module.exports = { getAllLgas };
