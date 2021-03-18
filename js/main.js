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

export function reselectGraph() {
    let chosenGraph = settings.select(currGraph)
    drawGraph(chosenGraph)
}

export function initRandomGraph() {
    setGraph(settings.generate())
}

export function setGraph(graph) {
    currGraph = graph
    settings.process(graph)
    reselectGraph()
}

export function update() {
    settings.update(currGraph)
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
