import dispatch from '../main';
import { setLanguage } from 'redux-i18n';
import { setCountryParams } from 'actions/countries';
import {
  setSpeciesParams,
  setSpeciesDetailParams,
  getSpeciesSeasons
} from 'actions/species';
import { setViewMode, setSiteParams, setLayer } from 'actions/sites';
import { commonSetLayer } from 'actions/common';
import { setLocation } from 'actions/threshold';

export function updateLanguage(actualState, replace, done) {
  dispatch(setLanguage(actualState.params.lang));
  done();
}

function getCountriesParams(state) {
  const {
    cat, iso, population
  } = state.params;
  const category = cat === 'lookAlikeSpecies' && population
    ? 'lookAlikeSpeciesPopulation'
    : cat;

  return {
    iso: iso || '',
    cat: category || 'sites',
    population,
    filter: state.location.query.filter || ''
  };
}

export function setSitesParams(state) {
  const viewMode = state.location.query.viewMode || 'map';
  dispatch(setViewMode(viewMode));
  const site = state.params.site || '';
  const cat = state.params.cat || 'species';
  const filter = state.location.query.filter || 'iba';
  dispatch(setSiteParams(site, cat, filter));
}

export function setupSpeciesParams(state) {
  const id = state.params.id || '';
  const cat = state.params.cat || 'over';
  dispatch(setSpeciesParams(id, cat));// , filter));
}

export function setCountriesPage(actualState, replace, done) {
  dispatch(setCountryParams(getCountriesParams(actualState)));
  done();
}

export function updateCountriesPage(prevState, nextState, replace, done) {
  dispatch(setCountryParams(getCountriesParams(nextState)));
  done();
}

export function updateSpeciesDetailPage(actualState, replace, done) {
  const id = actualState.params.id || '';
  const population = actualState.params.population;
  const category = actualState.params.cat === 'lookAlikeSpecies' && population
    ? 'lookAlikeSpeciesPopulation'
    : actualState.params.cat;
  const cat = category || 'sites'; // default value

  dispatch(setSpeciesDetailParams(id, cat, population));
  dispatch(getSpeciesSeasons(id));
  done();
}

export function setSpeciesPage(actualState, replace, done) {
  setupSpeciesParams(actualState);
  done();
}

export function setSitesPage(actualState, replace, done) {
  setSitesParams(actualState);
  done();
}

export function updateSitesPage(actualState, nextState, replace, done) {
  setSitesParams(nextState);
  done();
}

export function updateSitesDetailPage(actualState, replace, done) {
  const site = actualState.params.site || '';
  const cat = actualState.params.cat || 'species'; // default value
  const type = actualState.params.type || 'iba';

  if (site !== '') {
    dispatch(commonSetLayer('aewaExtent', false, setLayer));
    dispatch(commonSetLayer('birdLife', false, setLayer));
  }

  dispatch(setSiteParams(site, cat, undefined, type));
  done();
}

function setThresholdParams(state) {
  const coordinates = state.location.query.position && state.location.query.position.split(',') || null;
  if (coordinates) {
    dispatch(setLocation({
      lat: coordinates[0],
      lng: coordinates[1]
    }));
  }
}

export function setThresholdPosition(actualState, replace, done) {
  setThresholdParams(actualState);
  done();
}
export function updateThresholdPosition(actualState, nextState, replace, done) {
  setThresholdParams(nextState);
  done();
}
