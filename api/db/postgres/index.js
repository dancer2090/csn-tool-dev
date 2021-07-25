/* eslint-disable */
const { Sequelize } = require('sequelize');

const { literal, Op, fn, col, where } = Sequelize;
const env = process.env.POSTGRES_DB_ENV;
const configuration = require('../../../config/db/postgres/config')[env];

const createConnection = (config) => {
  const dialectOptions = {
    connectTimeout: 6000000,
    ssl: {
      require: config.ssl,
      rejectUnauthorized: false
    }
  };


  const connection = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      ssl: config.ssl,
      dialectOptions,
      pool: {
        handleDisconnects: true,
        max: 1,
        min: 1,
        idle: 100000,
        acquire: 200000
      }
    }
  );

  connection.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  return connection;
};

const sequelize = createConnection(configuration);

const connect = (config) => createConnection(config);

module.exports = {
  sequelize,
  Sequelize,
  literal,
  Op,
  fn,
  col,
  where,
  connect
};
