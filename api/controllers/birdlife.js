const fs = require('fs');
const bbox = require('geojson-bbox');
const shapefile = require('shapefile-stream');
const through = require('through2'); 
const { BirdLife } = require('../db/postgres/models');


async function getBirdlifeBySpeciesId(req, res) {
  try {
    const { id } = req.params;
    const polygons = await BirdLife.findAll({ where: { sis_id: id } });
    if (!polygons) {
      throw new Error('have filter');
    }
    const rows = polygons.map(p => {
      const feature = {
        type: 'Feature',
        geometry: p.geometry
      };
      const extent = bbox(feature);
      const resGeometry = {
        ...p.geometry,
        ...{
          bbox: extent
        }
      };
      
      return resGeometry;
    });

    res.status(200).json({ rows });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

function getBirdlifeShape(req, res) {
  const filePathShape = 'public/json/birdlife/index.json';
  try {
    const data = fs.readFileSync(filePathShape);
    const poly = JSON.parse(data)[3];
    const feature = {
      type: 'Feature',
      geometry: poly
    };
    const extent = bbox(feature);
    const resGeometry = {
      ...poly,
      ...{
        bbox: extent
      }
    };
    res.json(resGeometry);
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

async function addBirdlifeData(req, res) {
  try {
    let n = 0;
    shapefile.createReadStream('SpeciesRequest.shp')
      .pipe(through.obj(async (data, enc, next) => {
        if (n >= 5) {
          await BirdLife.create({
            type: data.type,
            object_id: data.properties.OBJECTID,
            sis_id: data.properties.SISID,
            binomial: data.properties.binomial,
            presence: data.properties.presence,
            origin: data.properties.origin,
            seasonal: data.properties.seasonal,
            compiler: data.properties.compiler,
            yrcompiled: data.properties.yrcompiled,
            citation: data.properties.citation,
            source: data.properties.source,
            dist_comm: data.properties.dist_comm,
            version: data.properties.version,
            geometry: data.geometry
          });
        }
        n++;
        next();
      }));
    res.json({
      status: 'success'
    });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
}

module.exports = {
  getBirdlifeBySpeciesId,
  getBirdlifeShape,
  addBirdlifeData
};
