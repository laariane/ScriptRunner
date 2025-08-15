import Convert from 'ansi-to-html'
import playButtonSvg from '../assets/svgs/playsolidfullgreen.svg'

window.addEventListener('DOMContentLoaded', displayScriptList)
window.scriptFunctionalities.streamScriptResult()
window.addEventListener('script-result', readResultsToTerminal)
/**
 * script consts
 */
const convert = new Convert()
const fileOpener = document.getElementById('file-opener')
const scriptList = document.getElementById('script-list')
const terminal = document.getElementById('terminal')
/***
 * event lisetners
 */
fileOpener.addEventListener('change', addScripts)

/**
 *  @namespace RendererEventHandlers
 */
/**
 * this function is responsible for sending the id to the main process to get processed :]
 * @param { HTMLElementEventMap }   event html event
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 */
async function runScript(event) {
  const scriptId = event.currentTarget.parentNode.scriptId
  window.scriptFunctionalities.runScript(scriptId)
}
/**
 * this function is responsible for sending the scripts to get stored  and trigger a re display of the script list
 * @param { HTMLElementEventMap }   event html event
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 */
async function addScripts(event) {
  const files = event.target.files
  console.log(files)
  await window.scriptFunctionalities.readScriptsPath(files)
  await displayScriptList()
}
/**
 * this function is responsible for displaying the list of scripts
 * @returns  {void}
 *
 * @memberof RendererEventHandlers
 * @todo add error handeling
 */
async function displayScriptList() {
  scriptList.replaceChildren()
  const { data, success } = await window.scriptFunctionalities.getAllScripts()
  const scripts = data
  if (success) {
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
  const scriptButtonRun = document.createElement('button')
  scriptButtonRun.setAttribute('class', 'button-normal')
  let imgPlayButton = document.createElement('img')
  imgPlayButton.innerText = "<img width='10px' alt='play button'></img>"
  // imgPlayButton.style.content = `url("${playButtonSvg}")`
  imgPlayButton.src = playButtonSvg
  scriptButtonRun.appendChild(imgPlayButton)
  // scriptButtonRun.innerHTML = `<img class ='play-button-img' src='${url(playButtonSvg)}' width="20px" alt="play button">`
  scriptButtonRun.addEventListener('click', runScript)
  listItem.appendChild(scriptButtonRun)
  scriptList.appendChild(listItem)
}

function readResultsToTerminal(event) {
  // const scriptResult = ansi_up.ansi_to_html(event.detail.data)
  const paragraph = document.createElement('p')
  paragraph.innerHTML = convert.toHtml(event.detail.data) + '\n'
  terminal.appendChild(paragraph)
}
