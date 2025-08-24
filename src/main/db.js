import { Sequelize, Model, DataTypes } from 'sequelize'
import path from 'node:path'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'script.db'),
  logging: false
})
export class Script extends Model {}
Script.init(
  {
    path: { unique: true, type: DataTypes.STRING },
    name: DataTypes.STRING
  },
  { sequelize, modelName: 'script' }
)

export class ScriptGroup extends Model {}
ScriptGroup.init(
  {
    name: { unique: true, type: DataTypes.STRING }
  },
  { sequelize, modelName: 'scriptGroup' }
)
export class ScriptGroup_Script extends Model {}
ScriptGroup_Script.init(
  {
    script_order: DataTypes.INTEGER
  },
  {
    sequelize
  }
)
Script.belongsToMany(ScriptGroup, { through: ScriptGroup_Script })
ScriptGroup.belongsToMany(Script, { through: ScriptGroup_Script, as: 'scripts' })

sequelize.sync().then(console.log('database init'))
// addDummyScript()
