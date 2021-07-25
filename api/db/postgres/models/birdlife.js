
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BirdLife extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  BirdLife.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: DataTypes.STRING,
    object_id: DataTypes.INTEGER,
    sis_id: DataTypes.INTEGER,
    binomial: DataTypes.STRING,
    presence: DataTypes.INTEGER,
    origin: DataTypes.INTEGER,
    seasonal: DataTypes.INTEGER,
    compiler: DataTypes.STRING,
    yrcompiled: DataTypes.INTEGER,
    citation: DataTypes.STRING,
    source: DataTypes.STRING,
    dist_comm: DataTypes.STRING,
    version: DataTypes.STRING,
    geometry: DataTypes.GEOMETRY
  }, {
    sequelize,
    modelName: 'BirdLife',
    tableName: 'birdlife',
    timestamps: false
  });
  return BirdLife;
};
