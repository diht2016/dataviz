import {parseGraphML, serializeGraphML} from "./graphml-core.js"
import {interceptFileDrops, selectFile, downloadFile} from './files.js'

export function interceptGraphDrops(callback) {
    interceptFileDrops(content => callback(parseGraphML(content)))
}

export function selectGraph(callback) {
    selectFile(content => callback(parseGraphML(content)), '.xml, application/xml')
}

function getGraphName(graph) {
    return `${graph.name}-${graph.n}n`
}

export function downloadGraph(graph) {
    downloadFile(getGraphName(graph) + '.xml', 'application/xml', serializeGraphML(graph))
}

export function downloadGraphSVG(graph, svgElement) {
    downloadFile(getGraphName(graph) + '.svg', 'image/svg+xml', svgElement.outerHTML)
}
