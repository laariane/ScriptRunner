import { Sequelize, Model, DataTypes } from 'sequelize'
import path from 'node:path'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'script.db'),
  logging: true
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
class ScriptGroup_Script extends Model {}
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

async function addDummyScript() {
  await sequelize.sync({ force: true }) // Ensure tables are created
  ScriptGroup.create(
    {
      name: 'groupScript1',
      scripts: [
        {
          path: 'C:\\Users\\admn\\Dev\\electron\\my-electron-app\\scripts\\openvscode.sh',
          name: 'openvscode.sh',
          ScriptGroup_Script: {
            script_order: 1
          }
        }
      ]
    },
    {
      include: [{ model: Script, as: 'scripts' }]
    }
  ).then((result) => console.log(result))
}
addDummyScript()
