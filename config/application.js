require('dotenv').config({ silent: true });

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const rootPath = path.join(process.cwd());

const app = express();
app.use(compression());
const APIRoutes = require('../api/routes');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Serving assets from public folder
app.use(express.static(path.join(rootPath, 'public')));

// Load api routes
app.use('/api', APIRoutes);

// Load environment config
require(path.join(__dirname, 'environments', process.env.NODE_ENV || 'development'))(app);

module.exports = app;
