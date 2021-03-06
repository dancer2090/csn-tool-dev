const fs = require('fs');
const normalizeSiteStatus = require('../helpers/index').normalizeSiteStatus;
const { runQuery, saveFileSync, getQueryString } = require('../helpers');

function getCountries(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = 'SELECT * FROM countries';
    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryDetails(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/index${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT * FROM countries WHERE iso3='${req.params.iso}'`;
    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data);
        if (result.rows && result.rows.length > 0) {
          const jsonData = JSON.stringify(result.rows[0]);
          saveFileSync(filePath, jsonData);
          res.json(result.rows[0]);
        } else {
          res.status(404);
          res.json({ error: 'No country found' });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountrySites(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/cities${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `with stc as (select site_id,
      SUM(case when iba_criteria = '' then 0 else 1 end) as iba
        from species_sites_iba group by site_id)
      SELECT
        c.country,
        c.iso3,
        coalesce(s.protection_status, 'Unknown') AS protected,
        s.site_name,
        s.lat,
        s.lon,
        s.site_id as id,
        s.site_id as site_id,
        stc.iba AS iba_species,
        s.hyperlink,
        s.iba_in_danger
      FROM sites_iba s
      INNER JOIN countries c ON s.country_id = c.country_id AND
      c.iso3 = '${req.params.iso}'
      LEFT JOIN stc ON stc.site_id = s.site_id
      ORDER BY s.site_name`;
    runQuery(query)
      .then((data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          results.map((item) => {
            const row = item;
            row.lat = +item.lat.toFixed(3);
            row.lon = +item.lon.toFixed(3);
            row.protected_slug = normalizeSiteStatus(item.protected);
            return row;
          });
        }
        const jsonData = JSON.stringify(results);
        saveFileSync(filePath, jsonData);
        res.json(results);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryCriticalSites(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/criticalSites${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `
      WITH csn_species_count AS (
        SELECT COUNT(*) AS csn_species, site_id
        FROM species_sites_critical
        GROUP BY site_id
      )
      SELECT
        s.site_id AS id,
        s.site_id AS site_id,
        s.site_name_clean AS csn_name,
        s.site_name_clean AS site_name,
        s.lat,
        s.lon,
        coalesce(protected, 'Unknown') AS protected,
        csc.csn_species AS csn_species,
        total_percentage
      FROM sites_critical s
      INNER JOIN csn_species_count AS csc ON csc.site_id = s.site_id
      WHERE s.iso3 = '${req.params.iso}'
      ORDER BY s.site_name ASC`;
    runQuery(query)
      .then((data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          results.map((item) => {
            const row = item;
            row.lat = +item.lat.toFixed(3);
            row.lon = +item.lon.toFixed(3);
            row.protected_slug = normalizeSiteStatus(item.protected);
            return row;
          });
        }
        const jsonData = JSON.stringify(results);
        saveFileSync(filePath, jsonData);
        res.json(results);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountrySpecies(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/species${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT s.scientific_name, s.english_name, s.french_name, s.genus, s.family,
      s.species_id as id, string_agg(p.population_name, ', ') as populations, s.hyperlink,
      sc.country_status, s.iucn_category, sc.occurrence_status
      FROM species s
      INNER JOIN species_country sc on sc.species_id = s.species_id
      INNER JOIN countries c on c.country_id = sc.country_id AND
        c.iso3 = '${req.params.iso}'
      INNER JOIN populations p on p.species_main_id = s.species_id
      GROUP BY s.scientific_name, s.english_name, s.french_name, s.genus, s.family, s.species_id, 1,
      s.hyperlink, sc.country_status, s.iucn_category, s.taxonomic_sequence,
      sc.occurrence_status
      ORDER BY s.taxonomic_sequence`;
    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}
function getCountryPopulations(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/populations${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT
      s.scientific_name,
      s.english_name,
      s.french_name,
      s.iucn_category,
      s.taxonomic_sequence,
      pi.wpepopid AS pop_id,
      s.species_id AS id,
      'http://wpe.wetlands.org/view/' || pi.wpepopid AS pop_hyperlink,
      pi.caf_action_plan, pi.eu_birds_directive,
      pi.a, pi.b, pi.c, pi.flyway_range,
      pi.year_start, pi.year_end,
      pi.size_min, pi.size_max,
      pi.population_name AS population,
      pi.ramsar_criterion_6 AS ramsar_criterion,
      pi.size_method,
      pi.trend_method
    FROM populations AS pi
    INNER JOIN species_country AS sc ON sc.species_id = pi.species_main_id AND sc.country_status != 'Vagrant'
    INNER JOIN countries c ON c.country_id = sc.country_id AND c.iso3 = '${req.params.iso}'
    INNER JOIN species AS s ON s.species_id = pi.species_main_id
    WHERE (
      ST_Intersects(pi.the_geom,(SELECT the_geom FROM world_borders WHERE iso3 = '${req.params.iso}'))
    )
    `;
    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryWithLookAlikeCounts(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/look-alike-species-count${queryStr}.json`;
  try {
    if (req.query.filter) throw new Error('have filter');
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `
      SELECT COUNT(sq.*) as counts
      FROM (
          SELECT DISTINCT
            sm.confusion_group,
            sm.species_id, 
            sm.scientific_name,
            sm.english_name,
            sm.taxonomic_sequence,
            pi.the_geom, 
            pi.wpepopid, 
            pi.population_name, 
            pi.a, 
            pi.b, 
            pi.c
            FROM species AS sm
            INNER JOIN species_country AS sc
            ON sc.species_id = sm.species_id
            AND sc.iso = '${req.params.iso}'
            INNER JOIN world_borders AS wb ON
            wb.iso3 = sc.iso
            INNER JOIN populations AS pi
            ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
            AND pi.species_main_id = sm.species_id
            WHERE
            sm.confusion_group IS NOT NULL
            ${req.query.filter ? `
            AND (
              sm.english_name LIKE '${req.query.filter}%'
              OR sm.scientific_name LIKE '${req.query.filter}%'
              OR sm.french_name LIKE '${req.query.filter}%'
              OR pi.population_name LIKE '${req.query.filter}%'
            )
            ` : ''}
            ) as sq`;
    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result[0].counts);
        if (!req.params.filter) saveFileSync(filePath, jsonData);
        res.json(result[0].counts);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryPopsWithLookAlikeCounts(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/look-alike-species${queryStr}.json`;
  try {
    if (req.query.filter) throw new Error('have filter');
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT 
    sm.scientific_name AS original_species,
    sm.english_name,
    sm.french_name,
    pi.population_name AS population, 
    pi.a AS original_a,
    pi.b AS original_b, 
    pi.c AS original_c,
    pi.wpepopid AS pop_id_origin,
    sm.species_id
  FROM species AS sm
  INNER JOIN species_country AS sc
    ON sc.species_id = sm.species_id
    AND sc.iso = '${req.params.iso}'
  INNER JOIN world_borders AS wb 
    ON wb.iso3 = sc.iso
  INNER JOIN populations AS pi
    ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
    AND pi.species_main_id = sm.species_id
  WHERE
    sm.confusion_group IS NOT NULL
  GROUP BY 
    sm.confusion_group, 
    sm.species_id, 
    sm.scientific_name, 
    sm.english_name, 
    sm.french_name,
    pi.the_geom, 
    pi.population_name,
    pi.a, 
    pi.b, 
    pi.c, 
    pi.wpepopid, 
    sm.taxonomic_sequence
  ORDER BY sm.taxonomic_sequence ASC`;

    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        if (!req.query.filter) saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryPopsWithLookAlikeCountsByOne(req, res) {
  const filePath = `public/json/countries/${req.params.iso}/look-alike-species-by-one${req.query.pop_id_origin}-${req.query.species_id}.json`;
  try {
    if (req.query.filter) throw new Error('have filter');
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT
    sq.wpepopid AS pop_id_origin,
    sq.a,
    COUNT(*) AS confusion_species,
    COUNT(case when pi.a IS NOT NULL
          AND pi.a != '' then pi.population_name end) AS confusion_species_as
    FROM
    (
      SELECT 
      sm.confusion_group,
      sm.species_id,
      pi.the_geom,
      pi.wpepopid,
      pi.a, 
      sm.taxonomic_sequence
      FROM species AS sm
        INNER JOIN species_country AS sc
            ON sc.species_id = sm.species_id
            AND sc.iso = '${req.params.iso}'
        INNER JOIN world_borders AS wb 
            ON wb.iso3 = sc.iso
        INNER JOIN populations AS pi
            ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
            AND pi.species_main_id = sm.species_id
            AND pi.wpepopid = '${req.query.pop_id_origin}'
        WHERE
          sm.confusion_group IS NOT NULL
          AND sm.species_id = '${req.query.species_id}'
      GROUP BY 
      sm.confusion_group, 
      sm.species_id,
      pi.the_geom, 
      pi.a,
      pi.wpepopid, 
      sm.taxonomic_sequence
    ) as sq
    INNER JOIN species AS sm ON
    (sq.confusion_group && sm.confusion_group)
    AND sm.species_id != sq.species_id
    INNER JOIN world_borders AS wb ON
    wb.iso3 = '${req.params.iso}'
    INNER JOIN populations AS pi
    ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
    AND ST_INTERSECTS(pi.the_geom, sq.the_geom)
    AND pi.species_main_id = sm.species_id
    GROUP BY  
    sq.species_id, 
    sq.a, 
    sq.wpepopid, 
    sq.taxonomic_sequence
    ORDER BY sq.taxonomic_sequence ASC`;

    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        if (!req.query.filter) saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getCountryLookAlikeSpecies(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/look-alike-species/${req.params.populationId}${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `
      SELECT
        sm.scientific_name AS scientific_name,
        sm.english_name,
        sm.french_name,
        sm.species_id AS id,
        pi.population_name AS population,
        pi.a,
        pi.b,
        pi.c,
        pi.wpepopid,
        pi.wpepopid AS pop_id
      FROM
      (
        SELECT 
        sm.confusion_group,
        sm.species_id, 
        sm.scientific_name,
        sm.taxonomic_sequence,
        pi.the_geom, 
        pi.wpepopid, 
        pi.population_name, 
        pi.a, 
        pi.b, 
        pi.c
        FROM species AS sm
        INNER JOIN species_country AS sc
        ON sc.species_id = sm.species_id
        AND sc.iso = '${req.params.iso}'
        INNER JOIN world_borders AS wb ON
        wb.iso3 = sc.iso
        INNER JOIN populations AS pi
        ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
        AND pi.species_main_id = sm.species_id
        AND pi.wpepopid = ${req.params.populationId}
        WHERE sm.confusion_group IS NOT NULL
        GROUP BY confusion_group,
        sm.species_id, 
        sm.scientific_name,
        sm.taxonomic_sequence,
        pi.the_geom, 
        pi.wpepopid, 
        pi.population_name, 
        pi.a, 
        pi.b, 
        pi.c
      ) as sq
      INNER JOIN species AS sm ON
      (sq.confusion_group && sm.confusion_group)
      AND sm.species_id != sq.species_id
      INNER JOIN world_borders AS wb ON
      wb.iso3 = '${req.params.iso}'
      INNER JOIN populations AS pi
      ON ST_INTERSECTS(pi.the_geom, wb.the_geom)
      AND ST_INTERSECTS(pi.the_geom, sq.the_geom)
      AND pi.species_main_id = sm.species_id
      ORDER BY sm.taxonomic_sequence ASC`;

    runQuery(query)
      .then((data) => {
        const result = JSON.parse(data).rows || [];
        const jsonData = JSON.stringify(result);
        saveFileSync(filePath, jsonData);
        res.json(result);
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

function getTriggerSpeciesSuitability(req, res) {
  const queryStr = getQueryString(req.query);
  const filePath = `public/json/countries/${req.params.iso}/trigger-suitability${queryStr}.json`;
  try {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } catch (errRead) {
    const query = `SELECT t2a.populationname AS population_name,
      t2a.species_c_254 AS species,
      t2a.season, t2a.percentfly, t2a.current_suitability,
      t2a.future_suitability, ROUND(CAST(change AS numeric), 2) AS change_suitability,
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
      WHERE t2a.iso3 = '${req.params.iso}'
      ORDER BY t2a.species_c_254 ASC`;

    runQuery(query)
      .then((data) => {
        const results = JSON.parse(data).rows || [];
        if (results && results.length > 0) {
          const jsonData = JSON.stringify(results);
          saveFileSync(filePath, jsonData);
          res.json(results);
        } else {
          res.status(404);
          res.json({ error: 'No species suitability information' });
        }
      })
      .catch((err) => {
        res.status(err.statusCode || 500);
        res.json({ error: err.message });
      });
  }
}

module.exports = {
  getCountries,
  getCountryDetails,
  getCountrySites,
  getCountryCriticalSites,
  getCountrySpecies,
  getCountryPopulations,
  getCountryPopsWithLookAlikeCounts,
  getCountryLookAlikeSpecies,
  getTriggerSpeciesSuitability,
  getCountryWithLookAlikeCounts,
  getCountryPopsWithLookAlikeCountsByOne
};
