

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('birdlife', 'id', {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }),

  down: async (queryInterface) => queryInterface.removeColumn('birdlife', 'id')
};
