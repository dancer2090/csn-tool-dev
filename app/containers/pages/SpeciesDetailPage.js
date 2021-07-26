import { connect } from 'react-redux';
import SpeciesDetailPage from 'components/pages/SpeciesDetailPage';
import {
  getSpeciesStats,
  getSpeciesSites,
  getSpeciesPopulation,
  getSpeciesCriticalSites,
  getSpeciesLookAlikeSpecies,
  getSpeciesLookAlikeSpeciesPopulation,
  getSpeciesPopulationVulnerability,
  getTriggerCriticalSuitability,
  getSpeciesBirdfile,
} from 'actions/species';

function getSpeciesData(species) {
  const id = species.selectedLASpeciesPopulation || species.selected;

  return species[species.selectedCategory] && species[species.selectedCategory][id]
    ? species[species.selectedCategory][id]
    : false;
}

const mapStateToProps = (state) => ({
  id: state.species.selected,
  selectedPopulationId: state.species.selectedLASpeciesPopulation,
  category: state.species.selectedCategory,
  stats: state.species.stats || false,
  data: getSpeciesData(state.species),
  lang: state.i18nState.lang,
  layers: state.species.layers,
});

const mapDispatchToProps = (dispatch) => ({
  getSpeciesBirdfile: id => dispatch(getSpeciesBirdfile(id)),
  getSpeciesStats: id => dispatch(getSpeciesStats(id)),
  getSpeciesData: (id, category, populationId) => {
    switch (category) {
      case 'criticalSites':
        dispatch(getSpeciesCriticalSites(id));
        break;
      case 'population':
        dispatch(getSpeciesPopulation(id));
        break;
      case 'lookAlikeSpecies':
        dispatch(getSpeciesLookAlikeSpecies(id));
        break;
      case 'lookAlikeSpeciesPopulation':
        dispatch(getSpeciesLookAlikeSpecies(id));
        dispatch(getSpeciesLookAlikeSpeciesPopulation(id, populationId));
        break;
      case 'populationVulnerability':
        dispatch(getSpeciesPopulationVulnerability(id));
        break;
      case 'triggerCriticalSuitability':
        dispatch(getTriggerCriticalSuitability(id));
        break;
      default:
        dispatch(getSpeciesSites(id));
        break;
    }
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(SpeciesDetailPage);
