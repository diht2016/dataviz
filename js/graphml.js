import {Graph} from './graph.js'

export function parseGraphML(xmlText) {
    let xml = new DOMParser().parseFromString(xmlText, 'text/xml')
    let graphElem = xml.getElementsByTagName('graph')[0]
    let children = Array.from(graphElem.children)
    let edgeType = graphElem.getAttribute('edgedefault')
    let vertexIds = children.filter(e => e.tagName == 'node').map(e => e.id)
    let graph = new Graph(vertexIds.length, edgeType == 'directed')
    children.filter(e => e.tagName == 'edge').forEach(e => {
        let a = vertexIds.indexOf(e.getAttribute('source'))
        let b = vertexIds.indexOf(e.getAttribute('target'))
        graph.setEdge(a, b)
    })
    return graph
}

export function serializeGraphML(graph) {
    let body = []
    graph.iterVertices(a => {
        body.push(`<node id="n${a}"/>`)
    })
    graph.iterEdges((a, b) => {
        body.push(`<edge source="n${a}" target="n${b}"/>`)
    })
    // todo: support directed graphs
    return `<?xml version="1.0" encoding="UTF-8"?>
    <graphml xmlns="http://graphml.graphdrawing.org/xmlns"  
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
      http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
      <graph id="G" edgedefault="undirected">${
          body.map(s => '\n' + ' '.repeat(8) + s).join('')}
      </graph>
    </graphml>`.replace(/\n {4}/g, '\n').trim()
}
