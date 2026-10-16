const db = require('../config/db');

async function getPollingUnits(req, res) {
  try {
    const { lga_id } = req.query;

    let sql = `
      SELECT
        pu.uniqueid,
        pu.polling_unit_id,
        pu.polling_unit_number,
        pu.polling_unit_name,
        pu.ward_id,
        pu.uniquewardid,
        pu.lga_id,
        w.ward_name
      FROM polling_unit pu
      LEFT JOIN ward w
        ON pu.uniquewardid = w.uniqueid
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

      sql += ' WHERE pu.lga_id = ?';
      params.push(parsedLgaId);
    }

    sql += ' ORDER BY pu.polling_unit_name ASC';

    const [pollingUnits] = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: pollingUnits.length,
      data: pollingUnits,
    });
  } catch (error) {
    console.error('Error fetching polling units:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve polling units.',
    });
  }
}

module.exports = { getPollingUnits };