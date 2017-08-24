const rp = require('request-promise');
const CARTO_SQL = require('../constants').CARTO_SQL;

const RESULTS_PER_PAGE = 200;

function getSites(req, res) {
  const table = req.query.filter === 'iba' ? 'sites' : 'sites_csn_points';
  const results = req.query.results || RESULTS_PER_PAGE;
  const search = req.query.search
    ? `${req.query.filter === 'iba' ? 'AND' : 'WHERE'} UPPER(s.country) like UPPER('%${req.query.search}%')
      OR UPPER(s.site_name) like UPPER('%${req.query.search}%')
      OR UPPER(s.protection_status) like UPPER('%${req.query.search}%')
      OR UPPER(s.csn) like UPPER('%${req.query.search}%')
      OR UPPER(s.iba) like UPPER('%${req.query.search}%')`
    : '';

  let query;
  if (req.query.filter === 'iba') {
    query = `with stc as (
      select site_id, SUM(case when iba_criteria = '' then 0 else 1
      end) as iba  from species_sites group by site_id
      ),
      p as (SELECT DISTINCT site_id FROM species_sites)
      SELECT s.country, s.iso3, s.iso2, s.site_name,
      s.protection_status AS protected, s.site_id as id, s.lat, s.lon,
      stc.iba AS iba_species, s.hyperlink,
      CASE
        WHEN s.iba_in_danger = true THEN true
        ELSE false
      END AS iba_in_danger
      FROM ${table} s
      INNER JOIN stc ON stc.site_id = s.site_id
      WHERE s.site_id IN (SELECT * from p) ${search}
      ORDER BY s.country ASC, s.site_name ASC`;
  } else {
    query = `WITH stc AS (
      SELECT site_id, COUNT(*) csn
      FROM species_sites
      GROUP BY site_id
    )
    SELECT s.country, s.site_name AS csn_name, protected,
    s.lat, s.lon, s.site_id AS id, stc.csn, s.iso3, s.iso2, total_percentage
    FROM ${table} s
    INNER JOIN stc ON stc.site_id = s.site_id
    ${search}
    ORDER BY s.country ASC, s.site_name ASC`;
  }

  rp(encodeURI(`${CARTO_SQL}${query}&rows_per_page=${results}&page=${req.query.page}`))
    .then((data) => {
      const result = JSON.parse(data);
      if (result.rows && result.rows.length > 0) {
        res.json(result.rows);
      } else {
        res.status(404);
        res.json({ error: 'No sites' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

function getSitesDetails(req, res) {
  let query;

  if (req.params.type === 'iba') {
    query = `SELECT sites.site_id AS id, protection_status AS protected,
    iso3 as country, site_name, lat, lon,
    hyperlink, csn, iba, COUNT(ss.species_id) AS qualifying_species,
    sites.iba_in_danger
    FROM sites
    INNER JOIN species_sites AS ss ON ss.site_id = sites.site_id
    WHERE sites.site_id = ${req.params.id}
    GROUP BY sites.site_id, sites.protection_status, iso3, site_name, lat,
    lon, hyperlink, csn, iba, iba_in_danger
    `;
  } else {
    query = `SELECT s.site_id AS id, protected,
      iso3 AS country, site_name_clean, lat, lon,
      COUNT(ss.species_id) AS qualifying_species
      FROM sites_csn_points AS s
      INNER JOIN species_sites AS ss ON ss.site_id = s.site_id
      WHERE s.site_id = ${req.params.id}
      GROUP BY s.site_id, protected, iso3, site_name, lat, lon`;
  }

  rp(CARTO_SQL + query)
    .then((data) => {
      const results = JSON.parse(data).rows || [];
      if (results && results.length > 0) {
        const row = results[0];
        res.json({
          site: [{
            name: row.site_name,
            id: row.id,
            country: row.country,
            protected: row.protected,
            lat: row.lat,
            lon: row.lon,
            hyperlink: row.hyperlink,
            csn: row.csn,
            iba: row.iba,
            iba_in_danger: row.iba_in_danger,
            qualifying_species: row.qualifying_species
          }]
        });
      } else {
        res.status(404);
        res.json({ error: 'No sites' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

function getSitesLocations(req, res) {
  let query;
  if (req.params.type === 'csn') {
    query = `SELECT s.site_name_clean, s.site_id as id, s.lat, s.lon,
    'csn' AS site_type  FROM sites_csn_points s`;
  } else {
    query = `SELECT s.site_name, s.site_id as id, s.lat, s.lon,
      'iba' AS site_type FROM sites s`;
  }
  rp(CARTO_SQL + query)
    .then((data) => {
      const result = JSON.parse(data);
      if (result.rows && result.rows.length > 0) {
        res.json(result.rows);
      } else {
        res.status(404);
        res.json({ error: 'No sites' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

function getSitesSpecies(req, res) {
  let query;

  if (req.params.type === 'iba') {
    query = `SELECT s.scientific_name, s.english_name, s.species_id AS id,
      s.iucn_category, si.lat, si.lon, si.site_name, s.hyperlink,
      ss._end AS end, ss.start, ss.minimum, ss.maximum, ss.season,
      ss.units, ss.iba_criteria, ss.geometric_mean
      FROM species_main AS s
      INNER JOIN species_sites AS ss ON ss.species_id = s.species_id
      INNER JOIN sites AS si ON si.site_id = ss.site_id
      WHERE si.site_id = ${req.params.id}
      ORDER BY s.taxonomic_sequence`;
  } else {
    query = `SELECT s.scientific_name, s.english_name, s.species_id AS id,
      s.iucn_category, si.lat, si.lon, si.site_name_clean, s.hyperlink,
      ss._end AS end, ss.start, ss.minimum, ss.maximum, ss.season,
      ss.units, ss.geometric_mean
      FROM species_main AS s
      INNER JOIN species_sites AS ss ON ss.species_id = s.species_id
      INNER JOIN sites_csn_points AS si ON si.site_id = ss.site_id
      WHERE si.site_id = ${req.params.id}
      ORDER BY s.taxonomic_sequence`;
  }

  rp(CARTO_SQL + query)
    .then((data) => {
      const result = JSON.parse(data);
      if (result.rows && result.rows.length > 0) {
        res.json({
          site: [{
            lat: result.rows[0].lat,
            lon: result.rows[0].lon,
            site_name: result.rows[0].site_name
          }],
          data: result.rows
        });
      } else {
        res.status(404);
        res.json({ site: [], data: [], error: 'No sites' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500);
      res.json({ error: err.message });
    });
}

module.exports = {
  getSites,
  getSitesDetails,
  getSitesLocations,
  getSitesSpecies
};
