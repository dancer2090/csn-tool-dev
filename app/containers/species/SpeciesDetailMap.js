import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SpeciesDetailMap from 'components/species/SpeciesDetailMap';

const getSelectedLASpeciesPopulation = ({ lookAlikeSpecies, selected, selectedLASpeciesPopulation }) => {
  if (!selectedLASpeciesPopulation) return null;

  const populations = lookAlikeSpecies[selected] || [];

  return populations.find(
    (las) => las.pop_id_origin === parseInt(selectedLASpeciesPopulation, 10)
  );
};
const getPopulations = createSelector(
  getSelectedLASpeciesPopulation,
  (species) => species.population,
  (species) => species.selected,
  (species) => species.selectedTableItem,
  (species) => species.birdlife,
  (selectedLASpeciesPopulation, population, selected, selectedTableItem, birdlife) => {
    const selectedALikeSpecies = selectedTableItem;

    if (!selectedLASpeciesPopulation) {
      return {
        populations: population[selected],
        fitToPopulationId: null,
        birdlife
      };
    }

    const selectedSpecies = {
      population: `${selectedLASpeciesPopulation.original_species} (${selectedLASpeciesPopulation.population})`,
      wpepopid: selectedLASpeciesPopulation.pop_id_origin
    };
    const results = [selectedSpecies];
    if (selectedALikeSpecies) {
      results.push({
        population: `${selectedALikeSpecies.scientific_name} (${selectedALikeSpecies.population})`,
        wpepopid: selectedALikeSpecies.wpepopid
      });
    }

    return {
      populations: results,
      fitToPopulationId: results.slice(-1)[0].wpepopid,
      birdlife,
    };
  }
);

const mapStateToProps = ({ species }) => {
  const {
    birdlife,
    populations,
    fitToPopulationId
  } = getPopulations(species);
  const sites = ['sites', 'criticalSites'].includes(species.selectedCategory)
        ? species[species.selectedCategory][species.selected]
        : false;

  return {
    id: species.selected,
    sites: sites || false,
    populations: populations || false,
    birdlife: birdlife || false,
    selectedPopulationId: species.highlightedPopulationId,
    fitToPopulationBoudaries: !species.selectedLASpeciesPopulation,
    fitToPopulationId,
    layers: species.layers
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesDetailMap);
