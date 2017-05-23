import React from 'react';
import GoBackLink from 'containers/common/GoBackLink';
import SitesMap from 'containers/sites/SitesMap';
import SitesDetailTable from 'containers/sites/SitesDetailTable';
import { StickyContainer } from 'react-sticky';

class SitesPage extends React.Component {
  componentWillMount() {
    this.props.getSitesStats(this.props.site, this.props.type);
    this.getData(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.getData(newProps);
  }

  getData(props) {
    if (!props.data) {
      props.getSitesData(props.site, props.category, props.type);
    }
  }

  render() {
    return (
      <div className="l-page">
        <div className="l-navigation">
          <div className="row">
            <div className="column">
              {this.props.stats.site &&
                <div className="navigation-wrapper">
                  <div className="c-navigation">
                    <div className="content">
                      <div className="title">
                        <GoBackLink className="breadcrumb" i18nText="back" endPoint="sites" />
                        <h2>{this.props.stats.site[0].name}</h2>
                      </div>
                      <div className="stats">
                        <div className="list">
                          <div className="item">
                            <div className="label">
                              Country
                            </div>
                            <div className="value">
                              {this.props.stats.site[0].country}
                            </div>
                          </div>
                          <div className="item">
                            <div className="label">
                              Protection status
                            </div>
                            <div className="value">
                              {this.props.stats.site[0].protected}
                            </div>
                          </div>
                          {this.props.type === 'iba' &&
                            <div className="item">
                              <div className="label">
                                IBA in danger
                              </div>
                              <div className="value">
                                {this.props.stats.site[0].iba_in_danger || '-'}
                              </div>
                            </div>
                          }
                          <div className="item">
                            <div className="label">
                              Qualifying Species
                            </div>
                            <div className="value">
                              {this.props.stats.site[0].qualifying_species}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        <div className="l-page">
          <div className="l-map -header -short">
            <SitesMap id="sites-detail-map" markerCluster slug={this.props.site} />
          </div>
          <StickyContainer>
            <div className="l-table">
              <div className="row l-content -short">
                <div className="column">
                  <SitesDetailTable
                    data={this.props.data}
                    slug={this.props.site}
                    category={this.props.category}
                    type={this.props.type}
                  />
                </div>
              </div>
            </div>
          </StickyContainer>
        </div>
      </div>
    );
  }
}

SitesPage.propTypes = {
  getSitesStats: React.PropTypes.func.isRequired,
  getSitesData: React.PropTypes.func.isRequired,
  stats: React.PropTypes.any,
  data: React.PropTypes.any,
  site: React.PropTypes.string,
  category: React.PropTypes.string,
  params: React.PropTypes.object,
  lang: React.PropTypes.string,
  type: React.PropTypes.string
};

export default SitesPage;
