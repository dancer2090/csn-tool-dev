import PropTypes from 'prop-types';

import { getSqlQuery } from 'helpers/map';
import { BOUNDARY_COLORS, SELECTED_AEWA_STYLE, SELECTED_BIRDLIFE_STYLE } from 'constants/map';
import BasicMap from './BasicMap';

class PopulationMap extends BasicMap {
  constructor(props) {
    super(props);
    this.setPopulationColors(props.populations);
    this.setAewaLayer = this.setAewaLayer.bind(this);
    this.setBirdLifeLayer = this.setBirdLifeLayer.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    const pane = this.map.createPane('populationBoundaries');
    pane.classList.add('-layer-blending');
    this.populationLayerGroup = L.layerGroup();
    this.populationLayerGroup.addTo(this.map);
  }

  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState);
    if (prevProps.layers.hasOwnProperty('aewaExtent') && prevProps.layers.aewaExtent !== this.props.layers.aewaExtent) {
      this.setAewaLayer();
    }
    if (prevProps.layers.hasOwnProperty('birdLife') && prevProps.layers.birdLife !== this.props.layers.birdLife) {
      this.setBirdLifeLayer();
    }
  }

  componentWillReceiveProps(newProps) {
    this.setPopulationColors(newProps.populations);

    if (newProps.populations !== this.props.populations) {
      this.populationLayerGroup.clearLayers(); // remove all population layers
    }

    const anyPopulationLayer = !!this.populationLayerGroup.getLayers().length;

    if (!newProps.layers.population) {
      this.map.removeLayer(this.populationLayerGroup); // hide population layer group
    } else {
      if (!anyPopulationLayer && this.props.populations !== newProps.populations) {
        if (newProps.fitToPopulationBoudaries) {
          this.fetchPopulationBoundaries(this.props.id);
        }
        this.fetchPopulationLayers(newProps);
      }

      if (anyPopulationLayer &&
          (this.props.selectedPopulationId !== newProps.selectedPopulationId ||
           this.props.layers.population !== newProps.layers.population ||
           this.props.populations !== newProps.populations)) {
        this.populationLayerGroup.addTo(this.map);
        this.populationLayerGroup.eachLayer((layer) => {
          const id = layer.options.populationId;
          const isActive = id === newProps.selectedPopulationId;

          layer.setStyle({ fill: isActive });
        });
      }
    }
  }

  setAewaLayer() {
    if (!this.selectedAewaLayer) {
      const query = `
         SELECT ST_AsGeoJSON(the_geom, 15, 1) as geom
         FROM aewa_extent_geo LIMIT 1
       `; // asGeoJSON with options - add bbox for fitBound
      getSqlQuery(query)
        .then(this.addAewaLayer.bind(this));
    } else {
      this.selectedAewaLayer.remove(this.map);
      this.selectedAewaLayer = null;
    }
  }

  addAewaLayer(data) {
    // layer not found, just set map view on selectedSite with default zoom
    if (!data.rows.length) {
      this.map.setView([this.props.selectedSite.lat, this.props.selectedSite.lon], 8);
      return;
    }

    const geom = JSON.parse(data.rows[0].geom);
    const layer = L.geoJSON(geom, {
      noWrap: true,
      style: SELECTED_AEWA_STYLE
    });
    layer.addTo(this.map);
    layer.bringToBack();
    this.selectedAewaLayer = layer;
  }

  setBirdLifeLayer() {
    if (!this.selectedBirdLifeLayer) {
/*      const query = `
         SELECT ST_AsGeoJSON(the_geom, 15, 1) as geom
         FROM aewa_extent_geo LIMIT 1
       `; // asGeoJSON with options - add bbox for fitBound
      getSqlQuery(query)
        .then(this.addAewaLayer.bind(this));*/
      const url = `${config.apiHost}/birdlife/shape`;
      fetch(url)
      .then(response => response.json())
      .then(this.addBirdLifeLayer.bind(this));
    } else {
      this.selectedBirdLifeLayer.remove(this.map);
      this.selectedBirdLifeLayer = null;
    }
  }

  addBirdLifeLayer(data) {
    // layer not found, just set map view on selectedSite with default zoom
    /*if (!data.length) {
      this.map.setView([this.props.selectedSite.lat, this.props.selectedSite.lon], 8);
      return;
    }*/
    //const geom = JSON.parse(data.rows[0].geom);

    const geom = data;

    const layer = L.geoJSON(geom, {
      noWrap: true,
      style: SELECTED_BIRDLIFE_STYLE
    });
    layer.addTo(this.map);
    layer.bringToBack();
    this.selectedBirdLifeLayer = layer;
  }

  setPopulationColors(populations) {
    this.populationColors = (populations || []).reduce((all, pop, index) => ({
      ...all,
      [pop.wpepopid]: BOUNDARY_COLORS[index]
    }), {});
  }

  fetchPopulationBoundaries(speciesId) {
    const query = `
      SELECT ST_AsGeoJSON(ST_Envelope(st_union(f.the_geom))) as bbox
      FROM species s
      INNER JOIN populations f on f.species_id = s.species_id
      WHERE s.species_id = ${speciesId}
    `;

    getSqlQuery(query).then(this.setPopulationBoundaries.bind(this));
  }

  setPopulationBoundaries(res) {
    const bounds = JSON.parse(res.rows[0].bbox);

    if (bounds) {
      const coords = bounds.coordinates[0];

      if (coords) {
        this.map.fitBounds([
          [coords[2][1], coords[2][0]],
          [coords[4][1], coords[4][0]]
        ]);
      }
    }
  }

  fetchPopulationLayers({ populations }) {
    if (populations) {
      populations.forEach((pop) => {
        this.fetchPopulationLayer(pop.wpepopid);
      });
    }
  }

  fetchPopulationLayer(populationId) {
    const query = `
      SELECT the_geom
      FROM populations
      WHERE wpepopid = ${populationId} LIMIT 1
    `;

    getSqlQuery(`${query}&format=geojson`)
      .then(this.addPopulationLayer.bind(this, populationId));
  }

  addPopulationLayer(populationId, layerGeoJSON) {
    // do not add layer if is already there
    const layers = this.populationLayerGroup.getLayers();

    if (layers.some((l) => l.options.populationId === populationId)) return;

    const color = this.populationColors[populationId];
    const isActive = this.props.selectedPopulationId === populationId;

    const layer = L.geoJSON(layerGeoJSON, {
      populationId,
      noWrap: true,
      pane: 'populationBoundaries',
      style: {
        weight: 3,
        dashArray: [1, 7],
        lineCap: 'round',
        color,
        fill: isActive,
        fillOpacity: 0.5,
        fillColor: color
      }
    });
    this.populationLayerGroup.addLayer(layer);
    if (this.props.fitToPopulationId === populationId) {
      this.map.fitBounds(layer.getBounds());
    }
  }
}

PopulationMap.propTypes = {
  ...BasicMap.propTypes,
  populations: PropTypes.any,
  selectedPopulationId: PropTypes.number,
  fitToPopulationBoudaries: PropTypes.bool,
  fitToPopulationId: PropTypes.number
};

export default PopulationMap;
