import React from 'react';
import NavLink from 'containers/common/NavLink';
import CountriesMap from 'containers/countries/CountriesMap';
import CountriesTable from 'containers/countries/CountriesTable';

class CountriesPage extends React.Component {

  componentWillMount() {
    if (this.props.country && !this.props.countryData) {
      this.props.getCountryData(this.props.country, this.props.category);
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.hasNewParams(newProps) && !newProps.countryData) {
      this.props.getCountryData(newProps.country, newProps.category);
    }
  }

  hasNewParams(newProps) {
    return this.props.country !== newProps.country
      || this.props.category !== newProps.category;
  }

  render() {
    return (
      <div className="l-page">
        <div className="l-navigation">
          <div className="row">
            <div className="column c-navigation">
              {this.props.country
                ? <div>
                  <NavLink className="breadcrumb" to="/countries" i18nText="backToCountries" />
                  <h2>{this.props.country}</h2>
                </div>
                : <h2>{this.context.t('countries')} <span>({this.props.countriesLength || ''})</span></h2>
              }
            </div>
          </div>
        </div>
        <div className={`l-map ${this.props.country ? '-short' : ''}`}>
          <CountriesMap />
        </div>
        <div className={`l-content ${!this.props.country ? '-no-padding' : ''}`}>
          <div className="row">
            <div className="column">
              {this.props.country &&
                <CountriesTable />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CountriesPage.contextTypes = {
  t: React.PropTypes.func.isRequired
};

CountriesPage.propTypes = {
  country: React.PropTypes.string,
  category: React.PropTypes.string,
  countryData: React.PropTypes.any,
  getCountryData: React.PropTypes.func.isRequired,
  countriesLength: React.PropTypes.number
};

export default CountriesPage;
