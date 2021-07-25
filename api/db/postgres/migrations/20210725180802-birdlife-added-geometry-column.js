

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('birdlife', 'geometry', {
    type: Sequelize.DataTypes.GEOMETRY
  }),

  down: async (queryInterface) => queryInterface.removeColumn('birdlife', 'geometry')
};
