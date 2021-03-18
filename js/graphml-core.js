import {Graph} from './graph.js'

export function parseGraphML(xmlText) {
    let parser = new DOMParser()
    try {
        let xml = parser.parseFromString(xmlText, 'text/xml')
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
    } catch(error) {
        alert('Failed to parse GraphML')
        throw error
    }
}

export function serializeGraphML(graph) {
    let body = []
    graph.iterVertices(a => {
        body.push(`<node id="n${a}"/>`)
    })
    graph.iterEdges((a, b) => {
        body.push(`<edge source="n${a}" target="n${b}"/>`)
    }, graph.isDirected)
    let edgeType = graph.isDirected ? 'directed' : 'undirected'
    return `<?xml version="1.0" encoding="UTF-8"?>
    <graphml xmlns="http://graphml.graphdrawing.org/xmlns"  
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
      http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
      <graph id="G" edgedefault="${edgeType}">${
          body.map(s => '\n' + ' '.repeat(8) + s).join('')}
      </graph>
    </graphml>`.replace(/\n {4}/g, '\n').trim()
}
