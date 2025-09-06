import path from 'node:path'
import { spawn } from 'node:child_process'
import { app, BrowserWindow } from 'electron/main'
import { ipcMain } from 'electron'
import { shell } from 'electron'
import { Script, ScriptGroup, sequelize } from './db'
const createWindow = () => {
  global.win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload/', 'index.js')
    }
  })
  // global.win.loadFile(path.join(__dirname, '..', 'renderer/', 'index.html'))
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    global.win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    global.win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  //connect to the database and shit
  createWindow()
  // for mac os platform
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/****
 * MAIN PROCESS LISTENERS
 */
ipcMain.handle('runScript', runScript)
ipcMain.handle('addScripts', addScripts)
ipcMain.handle('getAllScripts', getAllScripts)
ipcMain.handle('getAllGroupScripts', getAllGroupScripts)
ipcMain.handle('deleteScript', deleteScript)
ipcMain.handle('createGroupScript', createGroupScript)
ipcMain.handle('getGroupScriptElements', getGroupScriptElements)
ipcMain.handle('editScript', editScript)
ipcMain.handle('deleteGroupScript', deleteGroupScript)
ipcMain.handle('stopScript', stopScript)
ipcMain.handle('addScriptsToGroupScript', addScriptsToGroupScript)

/**
 * MAIN PROCESS HANDLERS
 * @namespace MainProcessHandlers
 */

/**
 * this function is responsible for adding a script or a batch of scripts
 * @param { Electron.IpcMainInvokeEvent } event ipc event
 * @param   {Array<Script>} arrayOfScripts array of scripts to add
 * @returns  {void} return the function sendToRender with the data required
 *
 * @memberof MainProcessHandlers
 */
async function addScripts(event, arrayOfScripts) {
  let queryArray = []
  const scriptNames = arrayOfScripts.names
  const scriptPaths = arrayOfScripts.paths
  for (let i = 0; i < scriptNames.length; i++) {
    queryArray.unshift({ name: scriptNames[i], path: scriptPaths[i] })
  }
  try {
    const scripts = await Script.bulkCreate(queryArray)
    return sendToRender(true, scripts)
  } catch (error) {
    console.error(error)
    return sendToRender(false, error.errors[0].message)
  }
}
/**
 * this function is responsible for searching for all the script in the sqlite db
 * @returns  {function} returns a the function sendToRender to with the data
 *
 * @memberof MainProcessHandlers
 *
 */
async function getAllScripts() {
  try {
    const scripts = await Script.findAll()
    return sendToRender(true, scripts)
  } catch (error) {
    return sendToRender(false, error.errors[0].message)
  }
}
async function getAllGroupScripts() {
  try {
    const groupScripts = await ScriptGroup.findAll()
    return sendToRender(true, groupScripts)
  } catch (error) {
    return sendToRender(false, error.errors[0].message)
  }
}
/**
 * this function is responsible for running and streaming the result of the script to the renderer process
 * @param { Electron.IpcMainInvokeEvent } event ipc event
 * @param {number} scriptId scriptId to query with
 * @returns  {function} returns the function sendToRenderer
 *
 * @memberof MainProcessHandlers
 *
 * @todo figure out a way to kill child processes when we are done with them think about the case of multiple
 */
async function runScript(event, scriptId) {
  const script = await Script.findOne({ where: { id: scriptId } })
  const scriptName = script.name
  //const scriptNameList = scriptName.split('.')
  const child = spawn(`${script.path}`)
  sendToRender(
    true,
    `--------------RUNNING SCRIPT ${scriptName} ------------------- `,
    'scriptResultStreaming'
  )
  process.stdin.pipe(child.stdin)
  child.stdout.on('data', (chunk) => {
    sendToRender(true, chunk.toString(), 'scriptResultStreaming')
  })
  child.on('data', (chunk) => {
    sendToRender(true, chunk.toString(), 'scriptResultStreaming')
  })
  child.on('SIGINT', () => {
    console.log('something here')
  })
  child.on('close', (code) => {
    if (code) {
      sendToRender(
        true,
        {
          processId: child.pid,
          description: `--------------${scriptName} EXITED WITH CODE: ${code} -------------------`
        },
        'scriptResultStreaming'
      )
    } else {
      sendToRender(
        true,
        {
          processId: child.pid,
          scriptId,
          description: `--------------${scriptName} STOPPED -------------------`
        },
        'scriptResultStreaming'
      )
    }
  })
  return sendToRender(true, child.pid)
}

async function deleteScript(event, scriptId) {
  try {
    const result = await Script.destroy({
      where: {
        id: scriptId
      }
    })
    sendToRender(true, result.toString(), 'scriptResultStreaming')
  } catch (error) {
    sendToRender(true, error.toString(), 'scriptResultStreaming')
  }
}
async function deleteGroupScript(event, groupScriptId) {
  try {
    const result = await ScriptGroup.destroy({
      where: {
        id: groupScriptId
      }
    })
    sendToRender(true, result.toString(), 'scriptResultStreaming')
  } catch (error) {
    sendToRender(true, error.toString(), 'scriptResultStreaming')
  }
}
async function createGroupScript(event, name) {
  if (name) {
    const result = await ScriptGroup.create({
      name: name
    })
    return result
  }
}
async function getGroupScriptElements(event, scriptGroupId) {
  if (scriptGroupId) {
    try {
      let result = await sequelize.query(`
      SELECT  scripts.id,scripts.name,path
      FROM scripts
      JOIN "ScriptGroup_Scripts" sgs ON scripts.id = sgs.scriptId
      JOIN "scriptGroups" sg ON sg.id = sgs."scriptGroupId"
      WHERE sg.id=${scriptGroupId}
      ORDER BY script_order ASC
    ;`)
      let finaleResult = result[0].map((result) => {
        return { dataValues: result }
      })
      return sendToRender(true, finaleResult)
    } catch (error) {
      return sendToRender(false, error)
    }
  }
}
async function editScript(event, scriptId) {
  let result = await Script.findOne({
    where: { id: scriptId }
  })
  console.log(result.dataValues.path)
  if (result.dataValues.path) {
    await shell.openPath(result.dataValues.path)
  }
}
async function stopScript(event, processId) {
  const result = process.kill(processId, 'SIGINT')
  console.log(`${processId} killed`)
  console.log(result)
}
async function addScriptsToGroupScript(event, data) {
  let script_order = 1
  let query = `INSERT INTO ScriptGroup_Scripts (script_order,scriptId,scriptGroupId,createdAt,updatedAt) values`
  for (let scriptId of data.scriptsSelected) {
    const queryValues = `(${script_order},${scriptId},${data.groupSelected},'${new Date().toISOString()}','${new Date().toISOString()}')`
    query += ' ' + queryValues
    if (data.scriptsSelected.indexOf(scriptId) + 1 !== data.scriptsSelected.length) {
      query += ','
    }
    script_order++
  }
  query += ';'
  let result = await sequelize.query(query)
  console.log(result)
}
/**
 * MAIN PROCESS UTIL FUNCTIONS
 * @namespace MainProcessUtilFunctions
 */

/**
 * this function is responsible for sending data to the renderer process
 *
 * @param {boolean} [success=false]
 * @param {T} data data to transfer to the renderer process
 * @param {string} channel channel if we are streaming data to the renderer process
 * @returns {{ success:boolean,data:T}}
 *
 * @memberof MainProcessUtilFunctions
 *
 */
function sendToRender(success = false, data = null, channel) {
  let result = {
    success: success,
    data: data
  }
  if (channel) {
    global.win.webContents.send(channel, result)
  } else {
    return result
  }
}
