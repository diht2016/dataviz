import {parseGraphML, serializeGraphML} from "./graphml-core.js"
import {interceptFileDrops, selectFile, downloadFile} from './files.js'

export function interceptGraphDrops(callback) {
    interceptFileDrops(content => callback(parseGraphML(content)))
}

export function selectGraph(callback) {
    selectFile(content => callback(parseGraphML(content)))
}

export function downloadGraph(graph) {
    let fileName = graph.name || 'graph'
    downloadFile(fileName, 'application/xml', serializeGraphML(graph))
}
