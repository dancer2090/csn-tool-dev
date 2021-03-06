import React from 'react';
import PropTypes from 'prop-types';
import NavLink from 'containers/common/NavLink';
import { withRouter } from 'react-router';

const TOOLS_PATHS = ['threshold-lookup'];

function MainNav(props, context) {
  const isTool = props.router.getCurrentLocation().pathname.indexOf(TOOLS_PATHS) > 0;
  return (
    <nav className="c-main-nav">
      <ul>
        <li>
          <NavLink to={"/countries"} i18nText="countries" parent />
        </li>
        <li>
          <NavLink to={"/sites?filter=iba"} i18nText="sites" parent />
        </li>
        <li>
          <NavLink to={"/species"} i18nText="species" parent />
        </li>
        <li className="parent">
          <span className={isTool ? '-current' : ''}>{context.t('tools')}</span>
          <ul>
            <li>
              <NavLink to={"/threshold-lookup"} i18nText="ramsarCriterionTool" parent />
            </li>
            <li>
              <NavLink to={"/advanced-search"} i18nText="advancedSearch" parent />
            </li>
          </ul>
        </li>
        <li>
          <NavLink to="/guidance" i18nText="guidance" parent />
        </li>
        <li>
          <NavLink to="/about" i18nText="about" parent />
        </li>
      </ul>
    </nav>
  );
}

MainNav.contextTypes = {
  // Define function to get the translations
  t: PropTypes.func.isRequired
};

MainNav.propTypes = {
  router: PropTypes.object.isRequired
};

export default withRouter(MainNav);
