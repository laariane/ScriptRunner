import Convert from 'ansi-to-html'
import playButtonSvg from '../assets/svgs/play-solid-full-green.svg'
import editButtonSvg from '../assets/svgs/pen-to-square-solid-full.svg'
import deleteButtonSvg from '../assets/svgs/trash-solid-full.svg'
import chevronRightSvg from '../assets/svgs/chevron-right.svg'

window.addEventListener('DOMContentLoaded', init)
window.scriptFunctionalities.streamScriptResult()
window.addEventListener('script-result', readResultsToTerminal)
/**
 * script consts
 */
const convert = new Convert()
const fileOpener = document.getElementById('file-opener')
const fileOpenerButton = document.getElementById('file-opener-button')
const scriptList = document.getElementById('script-list')
const groupScriptList = document.getElementById('group-script-list')
const terminal = document.getElementById('terminal')
const groupScriptCreationButton = document.getElementById('group-script-creation-button')
const groupScriptNameInput = document.getElementById('group-script-name-input')
const headerTitle = document.getElementById('header-title')
const scriptItemsButtons = [
  {
    img: playButtonSvg,
    handler: runScript
  },
  {
    img: editButtonSvg,
    handler: editScript
  },
  {
    img: deleteButtonSvg,
    handler: deleteScript
  }
]
const groupScriptButons = [
  {
    img: chevronRightSvg,
    handler: displayGroupScript
  }
]
/***
 * event lisetners
 */
fileOpener.addEventListener('change', addScripts)
fileOpenerButton.addEventListener('click', openFileExplorer)
groupScriptCreationButton.addEventListener('click', createGroupScript)
groupScriptNameInput.addEventListener('keyup', groupScriptNameInputHandler)
groupScriptNameInput.addEventListener('blur', () => {
  groupScriptNameInput.style.display = 'none'
})

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
// todo need to implement this , need to check if the user has setup an application to open his scripts or not
async function editScript() {}

async function deleteScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  console.log(scriptId)
  window.scriptFunctionalities.deleteScript(scriptId)
  displayScriptList()
}
async function displayGroupScript(event) {
  const groupScriptId = event.currentTarget.parentNode.groupScriptId
  const groupScriptName = event.currentTarget.parentNode.innerText
  headerTitle.innerText = `groupe script : ${groupScriptName}`
  console.log(groupScriptName)
  const { data, success } = await window.scriptFunctionalities.getGroupScriptElements(groupScriptId)
  console.log(data)
  if (success) {
    displayScriptList(data)
  }
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
 * @todo add error handelinge
 */
async function displayScriptList(groupScripts) {
  if (!groupScripts) {
    const { data, success } = await window.scriptFunctionalities.getAllScripts()
    const scripts = data
    if (scripts && success) {
      scriptList.replaceChildren()
      for (const script of scripts) {
        createScriptListItem(script)
      }
    }
  } else {
    const scripts = groupScripts
    scriptList.replaceChildren()
    for (const script of scripts) {
      createScriptListItem(script)
    }
  }
}
async function displayGroupScriptList() {
  const { data, success } = await window.scriptFunctionalities.getAllGroupScripts()
  const groupScripts = data
  if (groupScripts && success) {
    groupScriptList.replaceChildren()
    for (const group of groupScripts) {
      createGroupScriptListItem(group)
    }
  }
}

async function createGroupScript() {
  groupScriptNameInput.style.display = 'block'
  groupScriptNameInput.focus()
}
async function groupScriptNameInputHandler(event) {
  if (event.key === 'Enter') {
    const groupScriptName = event.target.value
    await window.scriptFunctionalities.createGroupScript(groupScriptName)
    groupScriptNameInput.style.display = 'none'
    displayGroupScriptList()
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
  createListItemButtons(listItem, scriptItemsButtons, 'scriptItem')
  scriptList.appendChild(listItem)
}

function createGroupScriptListItem(groupScript) {
  let listItem = document.createElement('li')
  listItem.setAttribute('class', 'script-item')
  listItem.groupScriptId = groupScript.dataValues.id
  listItem.innerHTML = `<span class='group-script-name'>${groupScript.dataValues.name}</span>`
  createListItemButtons(listItem, groupScriptButons)
  // need to implement the grouscriptlistitembuttons
  groupScriptList.appendChild(listItem)
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
function createListItemButtons(parentNode, buttons) {
  for (const button of buttons) {
    const scriptButton = document.createElement('button')
    scriptButton.setAttribute('class', 'button-normal')
    scriptButton.style.marginLeft = '10px'
    let imgPlayButton = document.createElement('img')
    imgPlayButton.innerText = `<img 'width='10px' alt='${button.img}'></img>`
    imgPlayButton.src = button.img
    scriptButton.appendChild(imgPlayButton)
    scriptButton.addEventListener('click', button.handler)
    parentNode.appendChild(scriptButton)
  }
}

/**
 */
function openFileExplorer() {
  fileOpener.click()
}

function init() {
  displayScriptList()
  displayGroupScriptList()
}
