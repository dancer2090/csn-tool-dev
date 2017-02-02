import { GET_COUNTRIES_LIST, GET_COUNTRIES_GEOM, GET_COUNTRIES_SITES,
        GET_COUNTRIES_STATS, GET_COUNTRIES_SITES_OLD, TOGGLE_COUNTRIES_LAYER,
        GET_COUNTRIES_SPECIES, GET_COUNTRIES_POPULATIONS, GET_COUNTRIES_SIMILAR_SPECIES,
        SET_COUNTRY_PARAMS, SET_COUNTRY_SEARCH } from 'constants';
import { push } from 'react-router-redux';

export function goCountryDetail(iso) {
  return (dispatch, state) => {
    const lang = state().i18nState.lang;
    dispatch(push(`/${lang}/countries/${iso}`));
  };
}

export function getCountriesList() {
  const url = `${config.apiHost}/countries`;
  return dispatch => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        dispatch({
          type: GET_COUNTRIES_LIST,
          payload: data
        });
      });
  };
}

export function getCountryStats(iso) {
  const url = `${config.apiHost}/countries/${iso}`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_STATS,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_STATS,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountrySites(iso) {
  const url = `${config.apiHost}/countries/${iso}/sites`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_SITES,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_SITES,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountrySitesOld(iso) {
  const url = `${config.apiHost}/countries/${iso}/sitesOld`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_SITES_OLD,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_SITES_OLD,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountrySpecies(iso) {
  const url = `${config.apiHost}/countries/${iso}/species`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_SPECIES,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_SPECIES,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountryPopulations(iso) {
  const url = `${config.apiHost}/countries/${iso}/populations`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_POPULATIONS,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_POPULATIONS,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountryLookAlikeSpecies(iso) {
  const url = `${config.apiHost}/countries/${iso}/look-alike-species`;
  return dispatch => {
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: GET_COUNTRIES_SIMILAR_SPECIES,
            payload: { iso, data }
          });
        });
    } catch (err) {
      dispatch({
        type: GET_COUNTRIES_SIMILAR_SPECIES,
        payload: { iso, data: [] }
      });
    }
  };
}

export function getCountriesGeom() {
  const url = '/geoms.topojson';
  return dispatch => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        dispatch({
          type: GET_COUNTRIES_GEOM,
          payload: data
        });
      });
  };
}

export function setCountryParams(params) {
  return {
    type: SET_COUNTRY_PARAMS,
    payload: { country: params.iso, category: params.cat, filter: params.filter }
  };
}

export function setSearchFilter(search) {
  return {
    type: SET_COUNTRY_SEARCH,
    payload: search
  };
}

export function toggleLayer(layer) {
  return {
    type: TOGGLE_COUNTRIES_LAYER,
    payload: layer
  };
}
