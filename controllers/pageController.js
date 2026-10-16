const db = require('../config/db');

async function getHomePage(req, res) {
try {
const [states] = await db.query(
'SELECT * FROM states ORDER BY state_name ASC'
);

res.render('index', { states });

} catch (error) {
console.error('Error loading homepage:', error.message);

res.status(500).send('Failed to load election results page.');

}
}

module.exports = { getHomePage };