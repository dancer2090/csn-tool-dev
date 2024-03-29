import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import SpeciesDetailLegend from 'containers/species/SpeciesDetailLegend';
import ClimateMap from 'components/maps/ClimateMap';

class SpeciesMap extends ClimateMap {
  constructor(props) {
    super(props);
    this.mapClassName = '-full';
  }

  componentDidMount() {
    super.componentDidMount();

    const { sites } = this.props;

    this.markers = [];
    if (sites && sites.length) {
      this.drawMarkers(sites);
    }
  }

  componentWillReceiveProps(newProps) {
    super.componentWillReceiveProps(newProps);

    if (newProps.layers.sites) {
      if (newProps.sites !== this.props.sites) {
        this.clearMarkers();
      }

      if (!this.markers.length && newProps.sites && newProps.sites.length) {
        this.drawMarkers(newProps.sites);
        this.fitMarkersBounds();
      }
    } else {
      this.clearMarkers();
    }
  }

  drawMarkers(speciesSites) {
    function getMarkerIcon(item) {
      return L.divIcon({
        className: 'map-marker',
        iconSize: null,
        html: `<span class='icon -${item.protected_slug}'</span>`
      });
    }
    speciesSites.forEach((item) => {
      if (item.lat && item.lon) {
        const marker = L.marker([item.lat, item.lon], { icon: getMarkerIcon(item) }).addTo(this.map);
        marker.
          bindPopup(`<p class="text -light" >Season: ${item.season}</p> <p class="text -light">Site: ${item.site_name}</p>`);
        marker.on('mouseover', function () {
          this.openPopup();
        });
        marker.on('mouseout', function () {
          this.closePopup();
        });
        this.markers.push(marker);
      }
    });
  }

  clearMarkers() {
    if (this.markers.length) {
      this.markers.forEach((item) => {
        this.map.removeLayer(item);
      });
      this.markers = [];
    }
  }

  fitMarkersBounds() {
    if (this.markers.length) {
      const markersGroup = new L.featureGroup(this.markers); // eslint-disable-line new-cap
      this.map.fitBounds(markersGroup.getBounds(this.props.id), { maxZoom: 6 });
    }
  }

  renderLegend() {
    return (
      <SpeciesDetailLegend
        populations={this.props.populations}
        populationColors={this.populationColors}
      />
   );
  }
}

SpeciesMap.propTypes = {
  ...ClimateMap.propTypes,
  sites: PropTypes.any.isRequired,
  birdlife: PropTypes.any,
};

export default withRouter(SpeciesMap);
