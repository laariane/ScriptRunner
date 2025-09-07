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
/**
 * script consts
 */
let GROUP_SCRIPTS = null
const convert = new Convert()
const fileOpener = document.getElementById('file-opener')
const modalOpenerButton = document.getElementById('modal-opener-button')
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
const dialogGroupScriptListContainer = document.getElementById('dialog-group-script-list-container')
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
    handler: (event) => {
      const groupScriptId = event.currentTarget.parentNode.groupScriptId
      const groupScriptName = event.currentTarget.parentNode.innerText
      displayGroupScriptsElements(event, groupScriptId, groupScriptName)
        .then((r) => console.log(r))
        .catch((error) => console.log(error))
    }
  }
]
/***
 * event listeners
 */
fileOpener.addEventListener('change', addScripts)
modalOpenerButton.addEventListener('click', openScriptSelectionModal)
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
  // dialogScriptList.replaceChildren()
  dialogGroupScriptListContainer.style.display = 'none'
  dialogLocalFileOpenerButton.style.display = 'block'
})
dialogGroupScriptRadioButton.addEventListener('click', () => {
  displayScriptList(null, dialogScriptList)
  dialogGroupScriptListContainer.style.display = 'block'
  dialogLocalFileOpenerButton.style.display = 'none'
})
dialogForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  console.log(e.currentTarget.elements[0].value)
  let groupSelected = document.getElementById('dialog-group-script-select')
  let groupName = document.querySelector(`option[value='${groupSelected.value}']`)
  let scriptsSelected = []
  for (const element of e.currentTarget.elements) {
    if (element.checked) {
      console.log(
        `Selected group: ${groupSelected.value} and we are going to add the script ${element.value}`
      )
      scriptsSelected.push(element.value)
    }
  }
  let data = {
    groupSelected: groupSelected.value,
    scriptsSelected
  }
  window.scriptFunctionalities.addScriptsToGroupScript(data)
  await displayGroupScriptsElements(e, groupSelected.value, groupName.innerHTML)
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
  await window.scriptFunctionalities.deleteGroupScript(groupScriptId)
  await displayGroupScriptList()
}
async function displayGroupScriptsElements(event, groupScriptId, groupScriptName) {
  headerTitle.innerText = `${groupScriptName.toUpperCase()}`
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
  GROUP_SCRIPTS = data
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
    const { data, success } = await window.scriptFunctionalities.createGroupScript(groupScriptName)
    groupScriptNameInput.style.display = 'none'
    displayGroupScriptList().then()
    await displayGroupScriptsElements(event, data.dataValues.id, data.dataValues.name)
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
function openScriptSelectionModal() {
  dialogTriggerToAddFiles.showModal()
  populateGroupScriptOptionsDialog()
  // fileOpener.click()
}

function populateGroupScriptOptionsDialog() {
  const dialogGroupScriptsOptions = document.getElementById('dialog-group-script-select')
  dialogGroupScriptsOptions.replaceChildren()
  for (const groupScript of GROUP_SCRIPTS) {
    let optionItem = document.createElement('option')
    optionItem.textContent = groupScript.dataValues.name
    optionItem.value = groupScript.dataValues.id
    dialogGroupScriptsOptions.appendChild(optionItem)
  }
}

function init() {
  displayScriptList(null, scriptList)
  displayGroupScriptList()
    .then()
    .catch((error) => console.log(error))
}
