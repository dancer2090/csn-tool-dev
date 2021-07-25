'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('birdlife', 'id', {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('birdlife', 'id');
  }
};
