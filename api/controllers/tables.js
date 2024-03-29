const fs = require('fs');
const keys = require('../helpers/keys');
const { google } = require('googleapis');
const translations = require('../helpers/timeTransl');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const tableId = process.env.GOOGLE_TABLE_ID;
/* eslint-disable */
async function getTheData(auth) {
  const gsapi = google.sheets({ version: 'v4', auth });
  const opt1 = {
    spreadsheetId: tableId,
    range: 'locales!A1:Z'
  };

  const data = await gsapi.spreadsheets.values.get(opt1);
  const rows = data.data.values;
  const langs = [];
  const resTranslations = {};
  if (rows.length) {
    rows.map((row, key) => {
      row.map((cell, kCell) => {
        if (kCell > 0) {
          if (key === 0) langs.push(cell);
          else {
            if (!resTranslations[langs[kCell - 1]]) resTranslations[langs[kCell - 1]] = {};
            resTranslations[langs[kCell - 1]][row[0]] = cell;
          }
        }
      });
    });
    await fs.writeFile(
      'public/json/locales.json',
      JSON.stringify(resTranslations),
      {
        encoding: 'utf8',
        mode: 0o777,
        flag: 'w+'
      },
      (err) => {
        if (err) throw err;
      }
    );
    return resTranslations;
  }
}
/* eslint-enable */
async function setTheData(auth, data, range) {
  const gsapi = google.sheets({ version: 'v4', auth });
  const resource = {
    values: data
  };
  const opt1 = {
    spreadsheetId: tableId,
    range,
    valueInputOption: 'RAW',
    resource
  };
  const res = await gsapi.spreadsheets.values.update(opt1);
  return res;
}
/*
const getLengths = (translations) => {
  return Object.keys(translations).map((a) => {
    const r = {};
    r[a] = Object.keys(translations[a]).length;
    return r;
  });
};
*/

const importFromSheet = async (req, res) => {
  try {
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      SCOPES
    );

    await client.authorize();
    const data = await getTheData(client);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
};

const importFromJs = async (req, res) => {
  try {
    const trKeys = Object.keys(translations);
    const dataKey = trKeys.sort((a, b) => (Object.keys(
      translations[a]).length < Object.keys(translations[b]).length
      ? 1
      : -1
    )[0]);
    const singleData = translations[dataKey];
    const dataWords = Object.keys(singleData).map((item) => {
      const words = trKeys.map((lang) => translations[lang][item]);
      return [item, ...words];
    });
    const data = [['Label', ...trKeys], ...dataWords];
    const range = `locales!A1:E${Object.keys(singleData).length + 1}`;
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      SCOPES
    );

    await client.authorize();
    const resData = await setTheData(client, data, range);
    res.json(resData);
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
};

const getTheMethodsData = async (auth) => {
  const tableIdImport = '1FKsvpgbajxdWMww9bR5336MabiYSHREoVULKVI5B2kY';
  const gsapi = google.sheets({ version: 'v4', auth });
  const opt1 = {
    spreadsheetId: tableIdImport,
    range: 'A:Z'
  };
  const data = await gsapi.spreadsheets.values.get(opt1);
  const rows = data.data.values;
  const convert = rows.map(r => ({
    wpepopid: r[1],
    size_method: r[4],
    trend_method: r[5]
  })).filter((r, n) => r.size_method && r.trend_method && n !== 0);
  return convert;
};


const importTrendSizeMethods = async (req, res) => {
  try {
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      SCOPES
    );

    await client.authorize();
    const data = await getTheMethodsData(client);
    const arr = [];
    data.forEach(item => {
      const query = `UPDATE populations SET size_method='${item.size_method}', trend_method='${item.trend_method}' WHERE wpepopid='${item.wpepopid}';`;
      arr.push(query);
    });


    res.json({ data: arr, str: arr.join('') });
  } catch (err) {
    res.status(err.statusCode || 500);
    res.json({ error: err.message });
  }
};

module.exports = {
  importFromJs,
  importFromSheet,
  importTrendSizeMethods
};
