import {initSVG, drawGraph} from "./svg-graph.js"
import * as Files from "./graph-files.js"

export let settings = {
    // default settings, can be overriden
    generate: () => {
        //import {pickRandomGraph} from "./graph.js"
        //pickRandomGraph()
        throw 'graph generator not specified'
    },
    process: (graph) => {
        //import {scatteredCircle} from "./js/scatter.js"
        //return scatteredCircle(graph)
        throw 'graph processing not specified'
    },
    select: (graph) => graph,
    update: (graph) => {},
}

let currGraph = null

function showErrors(f, action = 'process') {
    try {
        return f()
    } catch(error) {
        alert(`Failed to ${action} graph!\n${error}`)
        throw error
    }
}

export function reselectGraph() {
    let chosenGraph = showErrors(() => settings.select(currGraph), 'select')
    drawGraph(chosenGraph)
}

export function initRandomGraph() {
    setGraph(showErrors(() => settings.generate(), 'generate'))
}

export function setGraph(graph) {
    currGraph = graph
    showErrors(() => settings.process(graph))
    reselectGraph()
}

export function update() {
    showErrors(() => settings.update(currGraph), 'update')
    reselectGraph()
}

let svg = null

let initRandomListener = (e) => {
    initRandomGraph()
    e.preventDefault()
    e.stopPropagation()
}
let keyListener = (e) => {
    if (e.code == 'Enter') initRandomListener(e)
}

export function initMain() {
    svg = initSVG()
    window.onkeydown = keyListener
    svg.onmousedown = initRandomListener
    initRandomGraph()
    Files.interceptGraphDrops(setGraph)

    // downloading stub, can be triggered in devtools
    window.dlGraph = () => Files.downloadGraph(currGraph)
    window.dlSVG = () => Files.downloadGraphSVG(currGraph, svg)
}

let tickHandle = null
export function startUpdates(delay = 20) {
    stopUpdates()
    tickHandle = setInterval(update, delay)
}

export function stopUpdates() {
    clearInterval(tickHandle)
}

export function createIOControls(parent) {
    if (!parent) parent = document.getElementById('graph-io')
    let choose = document.createElement('button')
    choose.textContent = 'Choose Graph'
    choose.onclick = () => Files.selectGraph(setGraph)
    parent.appendChild(choose)
    let dlGraph = document.createElement('button')
    dlGraph.textContent = 'Download Graph'
    dlGraph.onclick = () => Files.downloadGraph(currGraph)
    parent.appendChild(dlGraph)
    let dlSvg = document.createElement('button')
    dlSvg.textContent = 'Download SVG'
    dlSvg.onclick = () => Files.downloadGraphSVG(currGraph, svg)
    parent.appendChild(dlSvg)
}
