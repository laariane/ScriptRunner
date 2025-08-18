const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('scriptFunctionalities', {
  readScriptsPath: (files) => readScriptsPath(files),
  runScript: (scriptId) => runScript(scriptId),
  deleteScript: (scriptId) => deleteScript(scriptId),
  getAllScripts: () => ipcRenderer.invoke('getAllScripts'),
  streamScriptResult: () => {
    ipcRenderer.on('scriptResultStreaming', (event, chunk) => {
      const customevent = new CustomEvent('script-result', { detail: chunk })
      window.dispatchEvent(customevent)
    })
  }
})

/****
 * handlers
 */

function readScriptsPath(files) {
  let result = {
    names: [],
    paths: []
  }
  for (const file in files) {
    const path = webUtils.getPathForFile(files[file])
    result.paths.unshift(path)
    result.names.unshift(files[file].name)
  }
  ipcRenderer.invoke('addScripts', result)
}

async function runScript(scriptId) {
  await ipcRenderer.invoke('runScript', scriptId)
}
async function deleteScript(scriptId) {
  await ipcRenderer.invoke('deleteScript', scriptId)
}
