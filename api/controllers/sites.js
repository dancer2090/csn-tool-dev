const { runQuery, getQueryString } = require('../helpers');
const cache = require('../helpers/cache');

const RESULTS_PER_PAGE = 200;

async function getSites(req, res) {
  try {
    const queryStr = getQueryString(req.query);
    const table = req.query.filter === 'iba' ? 'sites_iba' : 'sites_critical';
    const results = req.query.results || RESULTS_PER_PAGE;
    const search = req.query.search
      ? `${
        req.query.filter === 'iba' ? 'AND' : 'WHERE'
      } UPPER(s.country) like UPPER('%${req.query.search}%')
      OR UPPER(s.site_name) like UPPER('%${req.query.search}%')
      OR UPPER(s.protection_status) like UPPER('%${req.query.search}%')
      OR UPPER(s.csn) like UPPER('%${req.query.search}%')
      OR UPPER(s.iba) like UPPER('%${req.query.search}%')`
      : '';
    const cacheKey = `cites-${table}-${search}${queryStr}`;
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    let query;
    if (req.query.filter === 'iba') {
      query = `WITH stc AS (
          SELECT
            site_id,
            SUM(CASE WHEN iba_criteria = '' THEN 0 ELSE 1 END) as iba
          FROM species_sites_iba GROUP BY site_id
        ),
        p as (SELECT DISTINCT site_id FROM species_sites_iba)
        SELECT
          s.site_id,
          s.country,
          s.iso3,
          s.iso2,
          s.site_name,
          s.protection_status AS protected,
          s.site_id as id,
          s.lat,
          s.lon,
          coalesce(stc.iba, 0) AS iba_species,
          s.hyperlink,
          coalesce(s.iba_in_danger, false) as iba_in_danger,
          'iba' AS type
        FROM ${table} s
        LEFT JOIN stc ON stc.site_id = s.site_id
        WHERE s.site_id IN (SELECT * from p) ${search}
        ORDER BY s.country ASC, s.site_name ASC`;
    } else {
      query = `WITH stc AS (
        SELECT site_id, COUNT(*) csn
        FROM species_sites_critical
        GROUP BY site_id
      )
      SELECT
        s.site_id,
        s.country,
        s.site_name_clean AS csn_name,
        protected,
        s.site_name_clean AS site_name,
        s.lat,
        s.lon,
        s.site_id AS id,
        stc.csn,
        s.iso3,
        s.iso2,
        total_percentage,
        'csn' AS type
      FROM ${table} s
      LEFT JOIN stc ON stc.site_id = s.site_id
      ${search}
      ORDER BY s.country ASC, s.site_name ASC`;
    }
    runQuery(query, {
      rows_per_page: results,
      page: req.query.page
    })
      .then(async (data) => {
        const result = JSON.parse(data).rows || [];
        result.map((item) => {
          const row = item;
          row.lat = +item.lat.toFixed(3);
          row.lon = +item.lon.toFixed(3);
          return row;
        });
        const jsonData = JSON.stringify(result);
        await cache.add(cacheKey, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getSitesDetails(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `cites/${req.params.type}/${req.params.id}/index${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    let query;
    if (req.params.type === 'iba') {
      query = `SELECT
        s.site_id AS id,
        protection_status AS protected,
        s.iso3 as country,
        s.site_name,
        s.lat,
        s.lon,
        s.hyperlink,
        s.csn,
        s.iba,
        COUNT(ss.species_id) AS qualifying_species,
        s.iba_in_danger,
        'iba' AS type
      FROM sites_iba s
      LEFT JOIN species_sites_iba AS ss ON ss.site_id = s.site_id
      WHERE s.site_id = ${req.params.id}
      GROUP BY s.site_id, s.protection_status, s.iso3, s.site_name, s.lat, s.lon,
      s.hyperlink, s.csn, s.iba, s.iba_in_danger`;
    } else {
      query = `SELECT
        s.site_id AS id,
        s.protected,
        s.iso3 AS country,
        site_name_clean AS site_name,
        lat,
        lon,
        COUNT(ss.species_rec_id) AS qualifying_species,
        'csn' AS type
      FROM sites_critical AS s
      LEFT JOIN species_sites_critical AS ss ON ss.site_id = s.site_id
      WHERE s.site_id = ${req.params.id}
      GROUP BY s.site_id, s.protected, iso3, lat, lon, s.site_name_clean`;
    }
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];

        if (results && results.length > 0) {
          const row = results[0];
          const result = {
            site: [
              {
                name: row.site_name,
                id: row.id,
                country: row.country,
                protected: row.protected,
                lat: +row.lat.toFixed(3),
                lon: +row.lon.toFixed(3),
                hyperlink: row.hyperlink,
                csn: row.csn,
                iba: row.iba,
                iba_in_danger: row.iba_in_danger,
                qualifying_species: row.qualifying_species,
                type: row.type
              }
            ]
          };
          const jsonData = JSON.stringify(result);
          await cache.add(cacheKey, jsonData);
          res.json(result);
        } else {
          res.status(404);
          res.json({ error: 'Site Not Found' });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getSitesLocations(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `cites/locations/${req.params.type}/index${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    let query;
    if (req.params.type === 'csn') {
      query = `SELECT s.site_name_clean AS site_name, s.site_id as id, s.lat, s.lon,
      'csn' AS site_type  FROM sites_critical s`;
    } else {
      query = `SELECT s.site_name, s.site_id as id, s.lat, s.lon,
        'iba' AS site_type FROM sites_iba s`;
    }
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        results.map((item) => {
          const row = item;
          row.lat = +item.lat.toFixed(3);
          row.lon = +item.lon.toFixed(3);
          return row;
        });
        const jsonData = JSON.stringify(results);
        await cache.add(cacheKey, jsonData);
        res.json(results);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getSitesSpecies(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `cites/${req.params.type}/${req.params.id}/species${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    let query;
    if (req.params.type === 'iba') {
      query = `SELECT
        s.scientific_name,
        s.english_name,
        s.french_name,
        s.species_id AS id,
        s.iucn_category,
        si.lat,
        si.lon,
        si.site_name,
        s.hyperlink,
        ss._end AS end,
        ss.start,
        ss.minimum,
        ss.maximum,
        ss.season,
        ss.units,
        ss.iba_criteria,
        ss.geometric_mean
      FROM species AS s
      INNER JOIN species_sites_iba AS ss ON ss.species_id = s.species_id
      INNER JOIN sites_iba AS si ON si.site_id = ss.site_id
      WHERE si.site_id = ${req.params.id}
      ORDER BY s.taxonomic_sequence`;
    } else {
      query = `SELECT
        s.species_id AS id,
        ss.popmax as maximum,
        ss.popmin as minimum,
        ss.season,
        ss.units,
        ss.yearstart AS start,
        ss.yearend AS end,
        ss.percentfly,
        si.site_name_clean AS csn_site_name,
        si.lat,
        si.lon,
        si.country,
        si.iso2,
        si.protected,
        p.population_name AS population,
        s.iucn_category,
        s.english_name,
        s.french_name,
        s.scientific_name,
        si.site_name_clean AS site_name,
        s.hyperlink, ss.geometric_mean,
        ss.csn1::boolean,
        ss.csn2::boolean
      FROM sites_critical AS si
      INNER JOIN species_sites_critical ss ON ss.site_id = si.site_id
      INNER JOIN populations p on p.wpepopid = ss.wpepopid
      INNER JOIN species s ON s.species_id = p.species_main_id
      WHERE si.site_id = '${req.params.id}'
      ORDER BY s.taxonomic_sequence`;
    }
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        results.map((item) => {
          const row = item;
          row.lat = +item.lat.toFixed(3);
          row.lon = +item.lon.toFixed(3);
          return row;
        });
        const jsonData = JSON.stringify(results);
        await cache.add(cacheKey, jsonData);
        res.json(results);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function getSitesVulnerability(req, res) {
  const queryStr = getQueryString(req.query);
  const cacheKey = `cites/csn/${req.params.id}/vulnerability${queryStr}`;

  try {
    const dataCache = await cache.get(cacheKey);
    if (dataCache.status === 'fail') {
      throw new Error(dataCache.error);
    }
    if (dataCache.status === 'success' && dataCache.value !== null) {
      return res.json(JSON.parse(dataCache.value));
    }
    const query = `SELECT species.species_id AS id, species.scientific_name, species.english_name,
      t2a.season, t2a.current_suitability, t2a.future_suitability,
      ROUND(CAST(change AS numeric), 2) AS change_suitability,
      threshold,
      CASE
        WHEN season_ev_good_fair_poor_look_at = 'P'
        THEN 'Poor'
        WHEN season_ev_good_fair_poor_look_at = 'F'
        THEN 'Fair'
        WHEN season_ev_good_fair_poor_look_at = 'G'
        THEN 'Good'
        ELSE season_ev_good_fair_poor_look_at
      END AS season_ev
      FROM table2a AS t2a
      INNER JOIN species ON t2a.ssis::integer = species.species_id
      WHERE t2a.site_id = ${req.params.id}
      ORDER by scientific_name ASC`;
    runQuery(query)
      .then(async (data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          await cache.add(cacheKey, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No vulnerability information' });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  getSites,
  getSitesDetails,
  getSitesLocations,
  getSitesSpecies,
  getSitesVulnerability
};
