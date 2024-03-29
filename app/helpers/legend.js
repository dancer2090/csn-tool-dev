import { uniqueBy } from 'helpers/data';
import { BIRDLIFE_SEASONS } from 'constants/map'

const PROTECTION_LEVELS_ORDER = ['Little/none', 'Some', 'Most', 'Whole', 'Unknown'];
const HYDROLOGY_SECTIONS = [
  {
    name: 'Freshwater flow',
    layer: 'freshwaterFlow',
    subSections: [
      {
        layer: 'freshwaterFlowPresent',
        name: 'Average annual freshwater flow (present)',
        scale: [
          {
            name: '1 month',
            color: '#cbf5ff'
          },
          {
            name: '12 months',
            color: '#30cf92'
          }
        ]
      },
      {
        layer: 'freshwaterFlow2050',
        name: '% change in annual freshwater flow (2050)',
        items: [
          {
            name: 'Blueish colors (+10% to +100% increase)',
            icon: 'dots',
            color: '#414df4'
          },
          {
            name: 'Reddish colors (-10% to -100% decrease)',
            icon: 'dots',
            color: '#f44242'
          }
        ]
      }
    ]
  },
  {
    name: 'Inundation',
    layer: 'inudation',
    subSections: [
      {
        layer: 'inundationPresent',
        name: 'Average number of months inundated per year (present)',
        scale: [
          {
            name: '1 month',
            color: '#fff'
          },
          {
            name: '12 months',
            color: '#370093'
          }
        ]
      },
      {
        layer: 'inundation2050',
        name: 'Change in inundation duration (2050)',
        items: [
          {
            name: 'Blueish colors (2 to 12 months increase)',
            icon: 'dots',
            color: '#414df4'
          },
          {
            name: 'Reddish colors (2 to 12 months decrease)',
            icon: 'dots',
            color: '#f44242'
          }
        ]
      }
    ]
  }
];

function getSitesLegendSection(sites, isActive) {
  if (!sites || !sites.length) return null;

  const uniqueSites = uniqueBy(sites, 'protected_slug').map(site => ({
    icon: 'circle',
    name: site.protected,
    status: site.protected_slug
  }));

  uniqueSites.sort(
    (a, b) => PROTECTION_LEVELS_ORDER.indexOf(a.name) - PROTECTION_LEVELS_ORDER.indexOf(b.name)
  );

  return {
    i18nName: 'protectionLevel',
    active: isActive,
    layer: 'sites',
    items: uniqueSites
  };
}

function getPopulationsLegendSection(populations, populationColors, isActive) {
  if (!populations || !populations.length) return null;

  const mappedPopulation = (populations || []).map(pop => ({
    icon: 'dots',
    id: pop.wpepopid,
    name: pop.population,
    color: populationColors[pop.wpepopid]
  }));
  return {
    i18nName: 'populationBoundaries',
    active: isActive,
    layer: 'population',
    items: mappedPopulation.sort((a, b) => a.name.toString() > b.name.toString())
  };
}

function getSpeciesClimateLegendSection(layers) {
  const climateSections = [
    {
      name: 'Climate Change - Gains and Looses',
      layer: 'climate_gains',
      active: layers && layers.climate_gains,
      subSections: [
        {
          layer: 'climate_gains_S',
          name: 'Sedentary',
          active: layers && layers.climate_gains_S,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_gains_w',
          name: 'Winter',
          active: layers && layers.climate_gains_w,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_gains_b',
          name: 'Breeding',
          active: layers && layers.climate_gains_b,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_gains_p',
          name: 'Passage',
          active: layers && layers.climate_gains_p,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        }
      ]
    },
    {
      name: 'Climate Change - Present suitability',
      layer: 'climate_present',
      active: layers && layers.climate_present,
      subSections: [
        {
          layer: 'climate_present_w',
          name: 'Winter',
          active: layers && layers.climate_present_w,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_present_b',
          name: 'Breeding',
          active: layers && layers.climate_present_b,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_present_p',
          name: 'Passage',
          active: layers && layers.climate_present_p,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_present_S',
          name: 'Sedentary',
          active: layers && layers.climate_present_S,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        }
      ]
    },
    {
      name: 'Climate Change - Future suitability',
      layer: 'climate_future',
      climateSection: true,
      active: layers && layers.climate_future,
      subSections: [
        {
          layer: 'climate_future_w',
          name: 'Winter',
          active: layers && layers.climate_future_w,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_future_b',
          name: 'Breeding',
          active: layers && layers.climate_future_b,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_future_p',
          name: 'Passage',
          active: layers && layers.climate_future_p,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        },
        {
          layer: 'climate_future_S',
          name: 'Sedentary',
          active: layers && layers.climate_future_S,
          scale: [
            {
              name: 'Not suitable',
              color: 'yellow'
            },
            {
              name: 'Suitable',
              color: '#008ae5'
            }
          ]
        }
      ]
    }
  ];
  return climateSections;
}

export function getHydrologySections(layers) {
  const activeLayers = Object.keys(layers).filter(key => layers[key]);

  return HYDROLOGY_SECTIONS.map(section => {
    const subSections = section.subSections.map(s => ({
      ...s,
      active: activeLayers.includes(s.layer)
    }));

    return {
      ...section,
      subSections,
      active: activeLayers.includes(section.layer)
    };
  });
}

export function getAewaSections(layers) {
  const activeLayer = Object.keys(layers).filter(key => layers[key] && key === 'aewaExtent')[0];
  return [
    {
      active: layers[activeLayer],
      layer: 'aewaExtent',
      name: 'AEWA Extent'
    }
  ];
}

export function getBirdlifeSections(layers, birdlife = [], selected) {

  const activeLayer = Object.keys(layers).filter(key => layers[key] && key === 'birdLife')[0];
  let items = [];

  const filtered = [];
  birdlife.forEach(l => {
    if (!filtered.some(f => f.seasonal === l.seasonal)) filtered.push(l);
  });
  if (filtered && filtered.length > 0) {
    items = (filtered || []).map(l => ({
      icon: 'circle',
      id: l.id,
      name: BIRDLIFE_SEASONS.find(s => s.id === l.seasonal).name,
      color: l.color,
    }));
  }

  if (selected) {
    return [
      {
        active: layers[activeLayer],
        layer: 'birdLife',
        name: 'BirdLife International species range maps',
        items,
      }
    ];
  }
  return {};
}

export function getSitesSections(state) {
  const legend = [];
  const getLayers = state.layers || {};
  legend.push(...getHydrologySections(getLayers));
  if (getLayers.hasOwnProperty('aewaExtent') && state.selected === '') {
    legend.push(...getAewaSections(getLayers));
  }
  return legend;
}

export function getLegendData(state, { populations, populationColors }) {
  let legend = [];
  const showSiteProtectionLevels = ['sites', 'criticalSites'].includes(state.selectedCategory);
  const showClimateLayers = state.layers.climate;

  if (showSiteProtectionLevels) {
    const sites = state[state.selectedCategory][state.selected];
    legend.push(getSitesLegendSection(sites, state.layers.sites));
  }

  // if(showCLimateLay
  legend.push(getPopulationsLegendSection(populations, populationColors, state.layers.population));
  legend.push(...getHydrologySections(state.layers));
  if (state.layers.hasOwnProperty('aewaExtent')) {
    legend.push(...getAewaSections(state.layers));
  }
  // legend.push(...getHydrologySections(state.layers));

  //BirdLife
  if (state.layers.hasOwnProperty('birdLife')) {
    legend.push(...getBirdlifeSections(state.layers, state.birdlife,  state.selected));
  }

  if (showClimateLayers) {
    legend = legend.concat(getSpeciesClimateLegendSection(state.layers));
  }
  return legend.filter(l => l);
}
 