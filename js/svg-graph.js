let svgNS = 'http://www.w3.org/2000/svg'
let svg = document.createElementNS(svgNS, 'svg')

let margin = 0.1

svg.setAttribute('viewBox', [0-margin, 0-margin, 1+2*margin, 1+2*margin].join(' '))
svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
svg.setAttribute('stroke', '#ccc')
svg.setAttribute('fill', '#fa0')
document.body.appendChild(svg)

function createSvgElem(tagName) {
    let e = document.createElementNS(svgNS, tagName)
    svg.appendChild(e)
    return e
}

function setPoint(e, xy, r) {
    if (!e) e = createSvgElem('circle')
    e.setAttribute('r', r)
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    return e
}

function setLine(e, xy0, xy1) {
    if (!e) e = createSvgElem('line')
    e.setAttribute('x1', xy0[0])
    e.setAttribute('x2', xy1[0])
    e.setAttribute('y1', xy0[1])
    e.setAttribute('y2', xy1[1])
    return e
}

let currentGraph = null

function setGraph(graph2d) {
    if (currentGraph && currentGraph != graph2d) {
        clearGraph()
    }
    currentGraph = graph2d
    let scale = 1 / (graph2d.n + 15)

    // asserting that edges didn't change
    svg.setAttribute('stroke-width', 0.2 * scale)
    let elems = svg.children
    let i = 0
    graph2d.iterEdges((a, b) => {
        setLine(elems[i++], graph2d.xy[a], graph2d.xy[b])
    })
    graph2d.iterVertices(a => {
        setPoint(elems[i++], graph2d.xy[a], scale)
    })
}

function clearGraph() {
    svg.innerHTML = ''
    currentGraph = null
}
