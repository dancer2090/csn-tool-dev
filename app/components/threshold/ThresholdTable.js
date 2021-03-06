import React from 'react';
import PropTypes from 'prop-types';
import { Sticky } from 'react-sticky';
import TableList from 'components/tables/TableList';
import TableListHeader from 'containers/threshold/TableListHeader';
import ThresholdFilters from 'components/threshold/ThresholdFilters';
import ScrollButton from 'components/common/ScrollButton';

function ThresholdTable(props) {
  return (
    <div className="c-table">
      <ScrollButton />
      <Sticky topOffset={-120} stickyClassName={'-sticky'}>
        <ThresholdFilters
          data={props.data}
          columns={props.columns}
        />
        <TableListHeader
          data={props.data}
          columns={props.columns}
          allColumns={props.allColumns}
          detailLink
        />
      </Sticky>
      <TableList
        data={props.data}
        columns={props.columns}
        detailLink="species"
      />
    </div>
  );
}

ThresholdTable.contextTypes = {
  t: PropTypes.func.isRequired
};

ThresholdTable.propTypes = {
  allColumns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired
};

export default ThresholdTable;
