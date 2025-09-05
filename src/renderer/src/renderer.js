import Convert from 'ansi-to-html'
import playButtonSvg from '../assets/svgs/play-solid-full-green.svg'
import editButtonSvg from '../assets/svgs/pen-to-square-solid-full.svg'
import deleteButtonSvg from '../assets/svgs/trash-solid-full.svg'
import chevronRightSvg from '../assets/svgs/chevron-right.svg'
import stopSquare from '../assets/svgs/stop-square.svg'
/**
 * window events
 */
window.addEventListener('DOMContentLoaded', init)
window.scriptFunctionalities.streamScriptResult()
window.addEventListener('script-result', readResultsToTerminal)

/**
 * state of the application
 */
const state = {
  processId: null,
  running: false
}
// when we run the script change the button to to stop
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
const ListAllScriptsButton = document.getElementById('list-all-scripts-button')
const dialogTriggerToAddFiles = document.getElementById('dialog-to-add-files')
const dialogScriptList = document.getElementById('dialog-script-list')
const dialogAllScriptsRadioButton = document.getElementById('all-scripts-radio')
const dialogGroupScriptRadioButton = document.getElementById('group-radio')
const dialogForm = document.getElementById('dialog-form')
const dialogFromSubmitButton = document.getElementById('dialog-submit-button')
const dialogLocalFileOpenerButton = document.getElementById('dialog-local-file-opener')
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
const groupScriptbuttons = [
  {
    img: deleteButtonSvg,
    handler: deleteGroupScript
  },
  {
    img: chevronRightSvg,
    handler: displayGroupScripts
  }
]
/***
 * event listeners
 */
fileOpener.addEventListener('change', addScripts)
fileOpenerButton.addEventListener('click', openFileExplorer)
groupScriptCreationButton.addEventListener('click', createGroupScript)
groupScriptNameInput.addEventListener('keyup', groupScriptNameInputHandler)
groupScriptNameInput.addEventListener('blur', () => {
  groupScriptNameInput.style.display = 'none'
})
ListAllScriptsButton.addEventListener('click', () => {
  headerTitle.innerText = 'ALL SCRIPTS'
  displayScriptList(null, scriptList)
})
dialogAllScriptsRadioButton.addEventListener('click', () => {
  dialogScriptList.replaceChildren()
  dialogFromSubmitButton.style.display = 'none'
  dialogLocalFileOpenerButton.style.display = 'block'

})
dialogGroupScriptRadioButton.addEventListener('click', () => {
  displayScriptList(null, dialogScriptList)
  dialogFromSubmitButton.style.display = 'block'
  dialogLocalFileOpenerButton.style.display = 'none'
})
dialogForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // console.log(e.currentTarget.elements[0].value)
  dialogTriggerToAddFiles.close()
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
  const target = event.currentTarget
  const result = await window.scriptFunctionalities.runScript(scriptId)
  if (result) {
    changePlayButtonIntoStopButton(target)
    state.processId = result.data
    state.running = true
  }
}
async function stopScript(event, currentNode) {
  //stop the script
  const result = await window.scriptFunctionalities.stopScript(state.processId)
  state.processId = null
  state.running = false
  currentNode.addEventListener('click', runScript)
  currentNode.firstChild.src = playButtonSvg
}
// todo need to implement this , need to check if the user has setup an application to open his scripts or not
async function editScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  await window.scriptFunctionalities.editScript(scriptId)
}

async function deleteScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  console.log(scriptId)
  window.scriptFunctionalities.deleteScript(scriptId)
  displayScriptList(null, scriptList)
}
async function deleteGroupScript(event) {
  const groupScriptId = event.currentTarget.parentNode.groupScriptId
  console.log(groupScriptId)
  window.scriptFunctionalities.deleteGroupScript(groupScriptId)
  displayGroupScriptList()
}
async function displayGroupScripts(event) {
  const groupScriptId = event.currentTarget.parentNode.groupScriptId
  const groupScriptName = event.currentTarget.parentNode.innerText
  headerTitle.innerText = `${groupScriptName.toUpperCase()}`
  console.log(groupScriptName)
  const { data, success } = await window.scriptFunctionalities.getGroupScriptElements(groupScriptId)
  console.log(data)
  if (success) {
    displayScriptList(data, scriptList)
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
  displayScriptList(null, scriptList)
}
/**
 * this function is responsible for displaying the list of scripts
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 * @todo add error handling
 */
async function displayScriptList(groupScripts, nodeToFill) {
  if (!groupScripts) {
    const { data, success } = await window.scriptFunctionalities.getAllScripts()
    const scripts = data
    if (scripts && success) {
      nodeToFill.replaceChildren()
      for (const script of scripts) {
        createScriptListItem(script, nodeToFill)
      }
    }
  } else {
    const scripts = groupScripts
    scriptList.replaceChildren()
    for (const script of scripts) {
      createScriptListItem(script, nodeToFill)
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
 * this function is responsible creating the list items and their respective buttons and shit
 * @param {{dataValues:{path:string,name:string}} }   script  script fetched
 * @param nodeToFill
 * @returns  {void}
 *
 * @memberof RendererUtils
 */
function createScriptListItem(script, nodeToFill) {
  let listItem = document.createElement('li')
  listItem.setAttribute('class', 'script-item')
  listItem.scriptId = script.dataValues.id
  if (nodeToFill === dialogScriptList) {
    listItem.innerHTML = `<span class='script-name'>${script.dataValues.name}</span>`
    createDialogListItemButtons(listItem)
  } else {
    listItem.innerHTML = `<span class='script-name'>${script.dataValues.name}</span><span class='script-path'> ${script.dataValues.path}</span>`
    createListItemButtons(listItem, scriptItemsButtons)
  }
  nodeToFill.appendChild(listItem)
}

function createGroupScriptListItem(groupScript) {
  let listItem = document.createElement('li')
  listItem.setAttribute('class', 'script-item')
  listItem.groupScriptId = groupScript.dataValues.id
  listItem.innerHTML = `<span class='group-script-name'>${groupScript.dataValues.name}</span>`
  createListItemButtons(listItem, groupScriptbuttons)
  groupScriptList.appendChild(listItem)
}

function readResultsToTerminal(event) {
  const paragraph = document.createElement('p')
  if (typeof event.detail.data !== 'string' && 'processId' in event.detail.data) {
    paragraph.innerHTML = convert.toHtml(event.detail.data.description) + '\n'
    console.log(event.detail)
    terminal.appendChild(paragraph)
    state.processId = null
    state.running = false
    let listItemToReset
    scriptList.childNodes.forEach((item) => {
      if (item.scriptId === event.detail.data.scriptId) listItemToReset = item
    })
    changeStopButtonIntoPlayButton(listItemToReset)
  } else {
    console.log(event.detail)
    paragraph.innerHTML = convert.toHtml(event.detail.data) + '\n'
    terminal.appendChild(paragraph)
  }
}
/**
 *
 * @param {HTMLElement} parentNode
 * @param buttons
 */
function createListItemButtons(parentNode, buttons) {
  for (const button of buttons) {
    const scriptButton = document.createElement('button')
    scriptButton.setAttribute('class', 'button-normal')
    scriptButton.style.marginLeft = '10px'
    let imgPlayButton = document.createElement('img')
    imgPlayButton.innerText = `<img height='10px' width='10px' alt='${button.img}'></img>`
    imgPlayButton.src = button.img
    scriptButton.appendChild(imgPlayButton)
    scriptButton.addEventListener('click', button.handler)
    parentNode.appendChild(scriptButton)
  }
}
function createDialogListItemButtons(parentNode) {
  const confirmRadioButton = document.createElement('input')
  confirmRadioButton.type = 'checkbox'
  confirmRadioButton.value = parentNode.scriptId
  confirmRadioButton.id = parentNode.scriptId
  confirmRadioButton.setAttribute('class', 'confirmRadioButton')
  parentNode.appendChild(confirmRadioButton)
}
function changePlayButtonIntoStopButton(currentNode) {
  currentNode.firstChild.src = stopSquare
  currentNode.removeEventListener('click', runScript)
  currentNode.addEventListener('click', (event) => stopScript(event, currentNode), { once: true })
}
function changeStopButtonIntoPlayButton(currentNode) {
  let buttonToChange = currentNode.childNodes[2]
  buttonToChange.firstChild.src = playButtonSvg
  buttonToChange.addEventListener('click', runScript)
}
/**
 */
function openFileExplorer() {
  dialogTriggerToAddFiles.showModal()
  // fileOpener.click()
}

function init() {
  displayScriptList(null, scriptList)
  displayGroupScriptList()
}
