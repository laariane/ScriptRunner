const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('scriptFunctionalities', {
  readScriptsPath: (files) => readScriptsPath(files),
  runScript: (scriptId) => runScript(scriptId),
  deleteScript: (scriptId) => deleteScript(scriptId),
  getAllScripts: async () => {
    return await ipcRenderer.invoke('getAllScripts')
  },
  getAllGroupScripts: () => getAllGroupScripts(),
  streamScriptResult: () => {
    ipcRenderer.on('scriptResultStreaming', (event, chunk) => {
      const customEvent = new CustomEvent('script-result', { detail: chunk })
      window.dispatchEvent(customEvent)
    })
  },
  createGroupScript: (groupScriptName) => createGroupScript(groupScriptName),
  getGroupScriptElements: (groupScriptId) => getGroupScriptElements(groupScriptId),
  editScript: async (scriptId) => {
    return await ipcRenderer.invoke('editScript', scriptId)
  },
  stopScript: async (processId) => {
    return await ipcRenderer.invoke('stopScript', processId)
  },
  deleteGroupScript: async (groupScriptId) => {
    return await ipcRenderer.invoke('deleteGroupScript', groupScriptId)
  },
  addScriptsToGroupScript: async (data) => {
    return await ipcRenderer.invoke('addScriptsToGroupScript', data)
  }
})

/****
 * handlers
 */

async function readScriptsPath(files) {
  let result = {
    names: [],
    paths: []
  }
  for (const file in files) {
    const path = webUtils.getPathForFile(files[file])
    result.paths.unshift(path)
    result.names.unshift(files[file].name)
  }
  return await ipcRenderer.invoke('addScripts', result)
}

async function runScript(scriptId) {
  return await ipcRenderer.invoke('runScript', scriptId)
}
async function deleteScript(scriptId) {
  return await ipcRenderer.invoke('deleteScript', scriptId)
}

async function createGroupScript(groupScriptName) {
  await ipcRenderer.invoke('createGroupScript', groupScriptName)
}
async function getAllGroupScripts() {
  return ipcRenderer.invoke('getAllGroupScripts')
}
async function getGroupScriptElements(groupScriptId) {
  return await ipcRenderer.invoke('getGroupScriptElements', groupScriptId)
}
