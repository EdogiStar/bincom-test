const db = require('../config/db');

async function getPollingUnits(req, res) {
  try {
    const { lga_id } = req.query;

    let sql = `
      SELECT
        uniqueid,
        polling_unit_id,
        polling_unit_number,
        polling_unit_name,
        ward_id,
        lga_id
      FROM polling_unit
    `;

    const params = [];

    if (lga_id !== undefined) {
      const parsedLgaId = Number(lga_id);

      if (!Number.isInteger(parsedLgaId) || parsedLgaId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'lga_id must be a positive integer.',
        });
      }

      sql += ' WHERE lga_id = ?';
      params.push(parsedLgaId);
    }

    sql += ' ORDER BY polling_unit_name ASC';

    const [pollingUnits] = await db.query(sql, params);

    res.status(200).json({
      success: true,
      count: pollingUnits.length,
      data: pollingUnits,
    });
  } catch (error) {
    console.error('Error fetching polling units:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve polling units.',
    });
  }
}

module.exports = { getPollingUnits };
