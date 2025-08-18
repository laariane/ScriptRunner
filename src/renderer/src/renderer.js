import Convert from 'ansi-to-html'
import playButtonSvg from '../assets/svgs/play-solid-full-green.svg'
import editButtonSvg from '../assets/svgs/pen-to-square-solid-full.svg'
import deleteButtonSvg from '../assets/svgs/trash-solid-full.svg'

window.addEventListener('DOMContentLoaded', displayScriptList)
window.scriptFunctionalities.streamScriptResult()
window.addEventListener('script-result', readResultsToTerminal)
/**
 * script consts
 */
const convert = new Convert()
const fileOpener = document.getElementById('file-opener')
const fileOpenerButton = document.getElementById('fileOpenerButton')
const scriptList = document.getElementById('script-list')
const terminal = document.getElementById('terminal')
/***
 * event lisetners
 */
fileOpener.addEventListener('change', addScripts)
fileOpenerButton.addEventListener('click', openFileExplorer)

/**
 *  @namespace RendererEventHandlers
 */
/**
 * this function is responsible for sending the id to the main process to get processed :]
 * @param {Event}    event html event
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 */
async function runScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  window.scriptFunctionalities.runScript(scriptId)
}

async function editScript() {}

async function deleteScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  console.log(scriptId)
  window.scriptFunctionalities.deleteScript(scriptId)
  displayScriptList()
}
/**
 * this function is responsible for sending the scripts to get stored  and trigger a re display of the script list
 * @param { Event }   event html event
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 */
async function addScripts(event) {
  const files = event.target.files
  await window.scriptFunctionalities.readScriptsPath(files)
  displayScriptList()
}
/**
 * this function is responsible for displaying the list of scripts
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 * @todo add error handeling
 */
async function displayScriptList() {
  const { data, success } = await window.scriptFunctionalities.getAllScripts()
  const scripts = data
  if (scripts && success) {
    scriptList.replaceChildren()
    for (const script of scripts) {
      createScriptListItem(script)
    }
  }
}

/**
 @namespace RendererUtils
 */

/**
 * this function is responsible creating the list items and their respective buttons and shiii
 * @param {{dataValues:{path:string,name:string}} }   script  script fetched
 * @returns  {void}
 *
 * @memberof RendererUtils
 */
function createScriptListItem(script) {
  let listItem = document.createElement('li')
  listItem.setAttribute('class', 'script-item')
  listItem.scriptId = script.dataValues.id
  listItem.innerHTML = `<span class='script-name'>${script.dataValues.name}</span><span class='script-path'> ${script.dataValues.path}</span>`
  createListItemButtons(listItem)
  scriptList.appendChild(listItem)
}

function readResultsToTerminal(event) {
  const paragraph = document.createElement('p')
  paragraph.innerHTML = convert.toHtml(event.detail.data) + '\n'
  terminal.appendChild(paragraph)
}
/**
 *
 * @param {HTMLElement} parentNode
 */
function createListItemButtons(parentNode) {
  const divContainter = document.createElement('div')
  divContainter.setAttribute('class', 'container-script-button')
  const buttons = [playButtonSvg, editButtonSvg, deleteButtonSvg]
  for (const button of buttons) {
    const scriptButton = document.createElement('button')
    scriptButton.setAttribute('class', 'button-normal')
    scriptButton.style.marginLeft = '10px'
    let imgPlayButton = document.createElement('img')
    imgPlayButton.innerText = "<img width='10px' alt='play button'></img>"
    imgPlayButton.src = button
    scriptButton.appendChild(imgPlayButton)
    if (button === playButtonSvg) {
      scriptButton.addEventListener('click', runScript)
    } else if (button === editButtonSvg) {
      scriptButton.addEventListener('click', editScript)
    } else if (button === deleteButtonSvg) {
      scriptButton.addEventListener('click', deleteScript)
    }
    parentNode.appendChild(scriptButton)
  }
}
/**
 */
function openFileExplorer() {
  fileOpener.click()
}
