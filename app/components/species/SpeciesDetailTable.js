import React from 'react';
import PropTypes from 'prop-types';
import { Sticky } from 'react-sticky';

import LoadingSpinner from 'components/common/LoadingSpinner';
import ScrollButton from 'components/common/ScrollButton';
import SpeciesDetailFilters from 'components/species/SpeciesDetailFilters';
import SpeciesPopulationHeader from 'components/species/SpeciesPopulationHeader';
import TableList from 'components/tables/TableList';
import TableListHeader from 'containers/species/TableListHeader';

class SpeciesDetailTable extends React.Component {
  constructor(props) {
    super(props);
    this.handleTableItemClick = this.handleTableItemClick.bind(this);
  }

  getSelectedHeader() {
    const { selectedLASpeciesPopulation } = this.props;

    if (!this.props.selectedLASpeciesPopulation) return null;

    return (
      <SpeciesPopulationHeader
        species={selectedLASpeciesPopulation}
        backLinkTo={`/species/${selectedLASpeciesPopulation.species_id}/lookAlikeSpecies`}
      />
    );
  }

  getDetailLink(category) {
    switch (category) {
      case 'populations':
        return 'species';
      case 'population':
        return null; // no display
      case 'criticalSites':
        return 'sites/csn';
      case 'lookAlikeSpecies':
        return 'speciesPopulation';
      case 'lookAlikeSpeciesPopulation':
        return 'species';
      case 'sites':
        return 'sites/iba';
      default:
        return category;
    }
  }

  getLoading() {
    return (
      <div className="table-loading">
        <LoadingSpinner inner />
      </div>
    );
  }

  handleTableItemClick(item) {
    if (this.props.selectedLASpeciesPopulation) {
      this.props.selectSpeciesTableItem(item);
    }
  }

  renderTableHeader(isExpanded, data, columns, allColumns) {
    return (
      <div>
        <SpeciesDetailFilters
          data={data}
          columns={columns}
          isSearch={this.props.isSearch}
          id={this.props.id}
          category={this.props.category}
        />
        {isExpanded && this.getSelectedHeader()}
        <TableListHeader
          data={data}
          columns={columns}
          allColumns={allColumns}
          detailLink
        />
      </div>
    );
  }

  render() {
    const {
      allColumns,
      category,
      columns,
      data,
      isSearch,
      selectedLASpeciesPopulation,
      selectedTableItem
    } = this.props;

    const detailLink = this.getDetailLink(category);
    const isLookAlikeSpecies = category.startsWith('lookAlikeSpecies');
    const isExpanded = !!(isLookAlikeSpecies && selectedLASpeciesPopulation);

    return (
      <div className="c-table" >
        {!isSearch && <ScrollButton />}
        {isSearch ? (
          <div>
            {this.renderTableHeader(isExpanded, data, columns, allColumns)}
          </div>
        ) : (
          <Sticky topOffset={-120} stickyClassName={'-sticky'}>
            {this.renderTableHeader(isExpanded, data, columns, allColumns)}
          </Sticky>
        )}
        <TableList
          data={data}
          columns={columns}
          detailLink={detailLink}
          onItemClick={this.handleTableItemClick}
          selectable={isExpanded}
          selectedItem={selectedTableItem}
        />
      </div>
    );
  }
}

SpeciesDetailTable.contextTypes = {
  t: PropTypes.func.isRequired
};

SpeciesDetailTable.childContextTypes = {
  t: PropTypes.func.isRequired
};

SpeciesDetailTable.propTypes = {
  allColumns: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  isSearch: PropTypes.bool.isRequired,
  category: PropTypes.string.isRequired,
  data: PropTypes.any.isRequired,
  columns: PropTypes.array.isRequired,
  selectedLASpeciesPopulation: PropTypes.any,
  selectedTableItem: PropTypes.any,
  selectSpeciesTableItem: PropTypes.func.isRequired
};

export default SpeciesDetailTable;
