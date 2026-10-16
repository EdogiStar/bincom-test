const db = require('../config/db');

async function getPollingUnitResults(req, res) {
  try {
    const { pollingUnitId } = req.params;
    const parsedId = Number(pollingUnitId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Polling unit ID must be a positive integer.',
      });
    }

    const [results] = await db.query(
      `SELECT
         polling_unit_uniqueid,
         party_abbreviation,
         party_score
       FROM announced_pu_results
       WHERE polling_unit_uniqueid = ?
       ORDER BY party_abbreviation ASC`,
      [String(parsedId)]
    );

    res.status(200).json({
      success: true,
      polling_unit_id: parsedId,
      count: results.length,
      total_votes: results.reduce(
        (total, result) => total + result.party_score,
        0
      ),
      data: results,
    });
  } catch (error) {
    console.error('Error fetching polling-unit results:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve election results.',
    });
  }
}

async function getLgaResults(req, res) {
  try {
    const lgaId = Number(req.params.lgaId);

    if (!Number.isInteger(lgaId) || lgaId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'LGA ID must be a positive integer.',
      });
    }

    const [results] = await db.query(
      `SELECT
         pu.lga_id,
         apr.party_abbreviation,
         SUM(apr.party_score) AS total_votes
       FROM polling_unit pu
       INNER JOIN announced_pu_results apr
         ON apr.polling_unit_uniqueid = CAST(pu.uniqueid AS CHAR)
       WHERE pu.lga_id = ?
       GROUP BY pu.lga_id, apr.party_abbreviation
       ORDER BY total_votes DESC`,
      [lgaId]
    );
    
    const formattedResults = results.map((result) => ({
  ...result,
  total_votes: Number(result.total_votes),
}));

    res.status(200).json({
      success: true,
      lga_id: lgaId,
      count: results.length,
      total_votes: results.reduce(
        (total, result) => total + Number(result.total_votes),
        0
      ),
      data: formattedResults,
    });
  } catch (error) {
    console.error('Error fetching LGA results:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve LGA election results.',
    });
  }
}


module.exports = {
  getPollingUnitResults,
  getLgaResults,
};

module.exports = { getPollingUnitResults,
    getLgaResults
 };
