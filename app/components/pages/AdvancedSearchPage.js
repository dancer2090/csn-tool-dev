import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { StickyContainer } from 'react-sticky';

import Button from 'components/common/Button';
import LoadingSpinner from 'components/common/LoadingSpinner';
import SearchTable from 'containers/advanced-search/SearchTable';

const SEARCH_GROUPS = {
  geography: ['country', 'aewa_region', 'ramsar_region', 'site', 'protection', 'site_threat', 'site_habitat'],
  taxonomy: ['family', 'genus', 'species', 'red_list_status', 'aewa_annex_2', 'species_threat', 'species_habitat_association'],
  population: ['aewa_table_1_status', 'eu_birds_directive', 'cms_caf_action_plan', 'multispecies_flyway', 'population_trend']
};

function filterSitesByCountry(countries, sites) {
  if (!countries) return sites;
  const countryIds = countries.map((country) => country.value);
  return sites.filter((site) => countryIds.indexOf(site.country_id) > -1);
}
function filterSpeciesByGenusAndFamily(genus, families, species) {
  if (!genus && !families) return species;
  if (!genus || !genus.length > 0) {
    const familyValues = families.map((item) => item.value);
    return species.filter((site) => familyValues.indexOf(site.family) > -1);
  }
  if (!families || !families.length > 0) {
    const genusValues = genus.map((item) => item.value);
    return species.filter((site) => genusValues.indexOf(site.genus) > -1);
  }
  const genusValues = genus.map((item) => item.value);
  const familyValues = families.map((item) => item.value);
  return species.filter((site) => genusValues.indexOf(site.genus) > -1 || familyValues.indexOf(site.family) > -1);
}

class AdvancedSearchPage extends React.Component {
  constructor() {
    super();
    this.state = {
      filters: {},
      errors: {
        empty: false
      }
    };
  }

  componentWillMount() {
    if (!this.props.options) {
      this.props.getOptions();
    }
  }

  onSelectChange(section, value) {
    this.setState((state) => {
      const filters = {
        ...state.filters,
        [section]: value
      };
      const hasValue = this.hasFilters(filters);
      return {
        filters,
        errors: {
          empty: !hasValue
        }
      };
    });
  }

  onSearchClick(category) {
    const { filters } = this.state;
    if (this.hasFilters(filters)) {
      this.props.onSearch(category, filters);
    } else {
      this.setState({
        errors: {
          empty: true
        }
      });
    }
  }

  getFilteredOptions(section, options) {
    const { filters } = this.state;
    switch (section) {
      case 'site':
        return filters.country && filters.country.length > 0
          ? filterSitesByCountry(filters.country, options)
          : options;
      case 'species':
        return filters.genus && filters.genus.length > 0 || filters.family && filters.family.length > 0
          ? filterSpeciesByGenusAndFamily(filters.genus, filters.family, options)
          : options;
      default:
        return options;
    }
  }

  hasFilters(filters) {
    const keys = Object.keys(filters);
    for (let i = 0, kLength = keys.length; i < kLength; i++) {
      if (filters[keys[i]] && filters[keys[i]].length > 0) return true;
    }
    return false;
  }

  isFilterSelected({ filter, group }) {
    if (group) return SEARCH_GROUPS[group].some((f) => this.isFilterSelected({ filter: f }));

    const { filters } = this.state;

    return filters[filter] && filters[filter].length > 0;
  }

  renderContent() {
    const { filters } = this.state;
    const { data } = this.props;

    const hasSites = this.isFilterSelected({ filter: 'site' });
    const hasSpecies = this.isFilterSelected({ filter: 'species' });
    const hasResults = data && data.length;
    const anyPopulationFilter = this.isFilterSelected({ group: 'population' });
    const searchIBAsDisabled = hasSites || anyPopulationFilter;

    const resultsTable = (
      <StickyContainer>
        <SearchTable />
      </StickyContainer>
    );

    return (
      <div>
        {Object.keys(SEARCH_GROUPS).map((group, index) => (
          <div className="row c-search-group" key={index}>
            <div className="column small-12">
              <h3 className="group-title">{this.context.t(group.title)}</h3>
            </div>
            {SEARCH_GROUPS[group].map((section, index2) => {
              const value = filters[section] || null;
              const options = this.props.options && this.getFilteredOptions(section, this.props.options[section]) || [];

              return (
                <div className="column small-12 medium-3 group-field" key={index2}>
                  <h4 className="label">{this.context.t(section)}</h4>
                  <Select
                    multi
                    className="c-select -white"
                    name={section}
                    value={value}
                    options={options}
                    onChange={(select) => this.onSelectChange(section, select)}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div className="row c-search-actions">
          <div className="column medium-offset-6 validation-error">
            {this.state.errors.empty &&
              <span>{this.context.t('selectOneOption')}</span>
            }
          </div>
          <div className="column small-12 medium-2 medium-offset-4">
            <Button
              id="searchIBAsButton"
              className="-small -dark"
              disabled={searchIBAsDisabled}
              onClick={() => this.onSearchClick('ibas')}
            >
              {this.context.t('searchIBAs')}
            </Button>
          </div>
          <div className="column small-12 medium-2">
            <Button
              id="searchCriticalSitesButton"
              className="-small -dark"
              disabled={hasSites}
              onClick={() => this.onSearchClick('criticalSites')}
            >
              {this.context.t('searchCriticalSites')}
            </Button>
          </div>
          <div className="column small-12 medium-2">
            <Button
              id="searchSpeciesButton"
              className="-small -dark"
              onClick={() => this.onSearchClick('species')}
              disabled={hasSpecies}
            >
              {this.context.t('searchSpecies')}
            </Button>
          </div>
          <div className="column small-12 medium-2 ">
            <Button
              id="searchPopulationsButton"
              className="-small -dark"
              onClick={() => this.onSearchClick('populations')}
            >
              {this.context.t('searchPopulations')}
            </Button>
          </div>
        </div>
        {hasResults &&
          <div className="row">
            <div className="column">
              {resultsTable}
            </div>
          </div>
        }
      </div>
    );
  }

  render() {
    return (
      <div className="l-page">
        <div className="l-container">
          <div className="row">
            <div className="column">
              <h2 className="title">{this.context.t('advancedSearch')}</h2>
            </div>
          </div>
          {this.props.options
            ? this.renderContent()
            : <LoadingSpinner />
          }
        </div>
      </div>
    );
  }
}

AdvancedSearchPage.contextTypes = {
  t: PropTypes.func.isRequired
};

AdvancedSearchPage.propTypes = {
  data: PropTypes.any,
  columns: PropTypes.any,
  allColumns: PropTypes.any,
  options: PropTypes.object,
  getOptions: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired
};

export default AdvancedSearchPage;
