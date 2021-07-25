'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('birdlife', 'geometry', {
      type: Sequelize.DataTypes.GEOMETRY
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('birdlife', 'geometry');
  }
};
