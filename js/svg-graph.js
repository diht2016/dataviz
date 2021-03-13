const svgNS = 'http://www.w3.org/2000/svg'
let svg = null
let g = null

let margin = 0.1

export function initSVG() {
    svg = document.createElementNS(svgNS, 'svg')
    setLimits()
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.setAttribute('stroke', '#ccc')
    svg.setAttribute('fill', '#fa0')

    g = document.createElementNS(svgNS, 'g')
    svg.appendChild(g)

    document.body.appendChild(svg)
    return svg
}

function createGraphElem(tagName) {
    let e = document.createElementNS(svgNS, tagName)
    g.appendChild(e)
    return e
}

function setPoint(e, xy, r) {
    if (!e) e = createGraphElem('circle')
    e.setAttribute('r', r)
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    return e
}

function setLine(e, xy0, xy1) {
    if (!e) e = createGraphElem('line')
    e.setAttribute('x1', xy0[0])
    e.setAttribute('x2', xy1[0])
    e.setAttribute('y1', xy0[1])
    e.setAttribute('y2', xy1[1])
    return e
}

let defaultLimits = [0, 0, 1, 1]

function setLimits(limits) {
    if (!limits) limits = defaultLimits
    let w = limits[2] - limits[0]
    let h = limits[3] - limits[1]
    let xm = margin * Math.max(w, 0.5)
    let ym = margin * Math.max(h, 0.5)
    let view = [limits[0]-xm, limits[1]-ym, w+2*xm, h+2*ym]
    svg.setAttribute('viewBox', view.join(' '))
    return (w + h + 2 * (xm + ym)) / 2
}

let currentGraph = null

export function drawGraph(graph2d) {
    if (currentGraph != graph2d) {
        if (currentGraph) {
            clearGraph()
        }
        currentGraph = graph2d
        let graphDescElem = document.getElementById('curr-graph-desc')
        if (graphDescElem) {
            console.log(graph2d.description)
            graphDescElem.textContent = graph2d.description
        }
    }
    let limScale = setLimits(graph2d.limits)
    let scale = limScale / (graph2d.n + 15)

    // asserting that edges didn't change
    svg.setAttribute('stroke-width', 0.2 * scale)
    let elems = g.children
    let i = 0
    graph2d.iterEdges((a, b) => {
        setLine(elems[i++], graph2d.coords[a], graph2d.coords[b])
    })
    graph2d.iterVertices(a => {
        setPoint(elems[i++], graph2d.coords[a], scale)
    })
}

export function clearGraph() {
    g.innerHTML = ''
    currentGraph = null
}
