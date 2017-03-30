import { connect } from 'react-redux';
import TableListHeader from 'components/tables/TableListHeader';
import { setThresholdTableSort, setThresholdColumnFilter } from 'actions/threshold';

const mapStateToProps = (state) => ({
  sort: state.threshold.sort
});

const mapDispatchToProps = (dispatch) => ({
  sortBy: (sort) => dispatch(setThresholdTableSort(sort)),
  filterBy: (filter) => dispatch(setThresholdColumnFilter(filter))
});

export default connect(mapStateToProps, mapDispatchToProps)(TableListHeader);
