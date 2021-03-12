import {Graph} from './graph.js'

export function parseGraphML(xmlText) {
    let xml = new DOMParser().parseFromString(xmlText, 'text/xml')
    let graphElem = xml.getElementsByTagName('graph')[0]
    let children = Array.from(graphElem.children)
    let edgeType = graphElem.getAttribute('edgedefault')
    let vertexIds = children.filter(e => e.tagName == 'node').map(e => e.id)
    let graph = new Graph(vertexIds.length, isDirected = edgeType == 'directed')
    children.filter(e => e.tagName == 'edge').forEach(e => {
        let a = vertexIds.indexOf(e.getAttribute('source'))
        let b = vertexIds.indexOf(e.getAttribute('target'))
        graph.setEdge(a, b)
    })
    return graph
}
