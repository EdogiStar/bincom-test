require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

// Temporary request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const stateRoutes = require('./routes/stateRoutes');
const lgaRoutes = require('./routes/lgaRoutes');
const pollingUnitRoutes = require('./routes/pollingUnitRoutes');
const resultRoutes = require('./routes/resultRoutes');
const { getHomePage } = require('./controllers/pageController');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', getHomePage);

app.use('/api/states', stateRoutes);
app.use('/api/lgas', lgaRoutes);
app.use('/api/polling-units', pollingUnitRoutes);
app.use('/api/results', resultRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
