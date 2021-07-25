

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('birdlife', {
    type: Sequelize.DataTypes.STRING,
    object_id: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: null
    },
    sis_id: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    binomial: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    presence: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    origin: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    seasonal: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    compiler: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    yrcompiled: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    citation: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    source: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    dist_comm: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    version: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    geometry_type: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    geometry_coordinates: {
      type: Sequelize.DataTypes.GEOMETRY,
      defaultValue: null,
      allowNull: true
    }
  }),

  down: async (queryInterface) => {
    await queryInterface.dropTable('birdlife');
  }
};
