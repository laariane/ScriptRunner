/***
  i need an add button for the script group creation
  i need and add button for the script group scripts adding
  i need to be able to delete the scripts of a group or the group itself
  i need to be able to order the scripts in a script group
  i need to be able to run the script group
  i need to keep the state in the application
 */

import path from 'node:path'
import { spawn } from 'node:child_process'
import { app, BrowserWindow } from 'electron/main'
import { ipcMain } from 'electron'
import { Script } from './db'
const createWindow = () => {
  global.win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload/', 'index.js')
    }
  })
  global.win.loadFile(path.join(__dirname, '..', 'renderer/', 'index.html'))
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
 * MAIN PROCESS LISTNERS
 */
ipcMain.handle('runScript', runScript)
ipcMain.handle('addScripts', addScripts)
ipcMain.handle('getAllScripts', getAllScripts)
ipcMain.handle('deleteScript', deleteScript)

/**
 * MAIN PROCESS HANDLERS
 * @namespace MainProcessHandlers
 */

/**
 * this function is responsible for adding a script or a batch of scripts
 * @param { Electron.IpcMainInvokeEvent } event ipc event
 * @param   {Array<Script>} arrayOfScripts array of scripts to add
 * @returns  {void} retrun the function sendToRender with the data required
 *
 * @memberof MainProcessHandlers
 */
async function addScripts(event, arrayOfScripts) {
  let querryArray = []
  const scriptNames = arrayOfScripts.names
  const scriptPaths = arrayOfScripts.paths
  for (let i = 0; i < scriptNames.length; i++) {
    querryArray.unshift({ name: scriptNames[i], path: scriptPaths[i] })
  }
  console.log(querryArray)
  try {
    const scripts = await Script.bulkCreate(querryArray)
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
/**
 * this function is responsible for running and streaming the result of the script to the renderer process
 * @param { Electron.IpcMainInvokeEvent } event ipc event
 * @param {number} scriptId scriptId to query with
 * @returns  {function} returns the function sendToRendere
 *
 * @memberof MainProcessHandlers
 *
 * @todo figure out a way to kill child processes when we are done with them think about the case of multiple
 */
async function runScript(event, scriptId) {
  const script = await Script.findOne({ id: scriptId })
  const scriptName = script.name
  const scriptNameList = scriptName.split('.')
  const exentsion = scriptNameList[scriptNameList.length - 1]
  if (exentsion === 'sh' || exentsion === 'bash') {
    const child = spawn(`sh  ${script.path} && sh ${script.path} `, { shell: true })
    sendToRender(
      true,
      `--------------RUNNING SCRIPT ${scriptName} ------------------- `,
      'scriptResultStreaming'
    )
    child.stdout.on('data', (chunk) => {
      sendToRender(true, chunk.toString(), 'scriptResultStreaming')
    })
    child.stderr.on('data', (chunk) => {
      console.log(chunk.toString())
      sendToRender(true, chunk.toString(), 'scriptResultStreaming')
    })
    child.on('close', (code) => {
      console.log(code)
    })
  }
}

async function deleteScript(event, scriptId) {
  console.log(scriptId)
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
/**
 * MAIN PROCESS UTIL FUNCTIONS
 * @namespace MainProcessUtilFunctions
 */

/**
 * this function is responsible for sending data to the rendere process
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
