import { connect } from 'react-redux';
import SitesDetailTable from 'components/sites/SitesDetailTable';
import { filterColumnsBasedOnLanguage } from 'helpers/language';
import { filterData } from 'helpers/filters';

const mapStateToProps = (state) => {
  const sites = state.sites;
  const columns = sites.columns;
  const data = sites[sites.selectedCategory] && sites[sites.selectedCategory][sites.selected]
    ? sites[sites.selectedCategory][sites.selected]
    : false;

  return {
    site: sites.selected,
    category: sites.selectedCategory,
    data: filterData({ data, columns, filter: sites.searchFilter, columnFilter: sites.columnFilter }),
    type: sites.type,
    columns,
    allColumns: filterColumnsBasedOnLanguage(sites.allColumns, state.i18nState.lang)
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SitesDetailTable);
