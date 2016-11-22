const rp = require('request-promise');
const CARTO_SQL = require('../constants').CARTO_SQL;

function getSpeciesList(req, res) {
  const query = `SELECT s.*, ss.iba_criteria, ss.maximum as max, ss.minimum as min, ss.season
    FROM species s
    INNER JOIN species_sites ss ON s.species_id = ss.species_id
    LIMIT 50`;
  rp(CARTO_SQL + query)
    .then((data) => {
      const results = JSON.parse(data).rows || [];
      if (results && results.length > 0) {
        results.map((item) => {
          const species = item;
          species.avg = (item.max + item.min) / 2;
          return species;
        });
        res.json(results);
      } else {
        res.status(404);
        res.json({ error: 'No species' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

function getSpecies(req, res) {
  const query = `SELECT s.*, ss.iba_criteria, ss.maximum as max, ss.minimum as min, ss.season, si.lat, si.lon, si.site_name as site_name
    FROM species s
    INNER JOIN species_sites ss ON s.species_id = ss.species_id
    INNER JOIN sites si ON ss.site_id = si.site_id
    WHERE s.slug = '${req.params.slug}'
    ORDER BY si.site_name`;
  rp(CARTO_SQL + query)
    .then((data) => {
      const results = JSON.parse(data).rows || [];
      if (results && results.length > 0) {
        results.map((item) => {
          const species = item;
          species.avg = (item.max + item.min) / 2;
          return species;
        });
        res.json(results);
      } else {
        res.status(404);
        res.json({ error: 'No species' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

module.exports = {
  getSpeciesList,
  getSpecies
};
