import {Graph} from './graph.js'

export function parseStringAsXML(xmlText) {
    let parser = new DOMParser()
    let xml = parser.parseFromString(xmlText, 'text/xml')
    if (xml.activeElement.tagName == 'parsererror') {
        let errorNodes = xml.activeElement.childNodes
        throw new Error(errorNodes[0].data + '\n' + errorNodes[1].textContent)
    }
    return xml
}

export function parseGraphML(xmlText) {
    try {
        let xml = parseStringAsXML(xmlText)
        let graphElem = xml.getElementsByTagName('graph')[0]
        if (!graphElem) {
            throw new Error('<graph> element not found')
        }
        let children = Array.from(graphElem.children)
        let edgeType = graphElem.getAttribute('edgedefault')

        let vertexIds = children.filter(e => e.tagName == 'node').map(e => e.id)
        function indexById(id) {
            let index = vertexIds.indexOf(id)
            if (index == -1) {
                throw new Error(`Cannot find vertex with id '${id}'`)
            }
            return index
        }

        let graph = new Graph(vertexIds.length, edgeType == 'directed')
        if (graphElem.id) {
            graph.name = graphElem.id
            graph.description = graphElem.id
        }
        children.filter(e => e.tagName == 'edge').forEach(e => {
            let a = indexById(e.getAttribute('source'))
            let b = indexById(e.getAttribute('target'))
            graph.setEdge(a, b)
        })
        return graph
    } catch(error) {
        alert('Failed to parse GraphML\n' + error)
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
      <graph id="${graph.name}" edgedefault="${edgeType}">${
          body.map(s => '\n' + ' '.repeat(8) + s).join('')}
      </graph>
    </graphml>`.replace(/\n {4}/g, '\n').trim()
}
