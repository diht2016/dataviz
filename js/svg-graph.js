let ns = 'http://www.w3.org/2000/svg'
let svg = document.createElementNS(ns, 'svg')

let margin = 0.1

svg.setAttribute('viewBox', [0-margin, 0-margin, 1+2*margin, 1+2*margin].join(' '))
svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
svg.setAttribute('stroke', '#ccc')
svg.setAttribute('fill', '#fa0')
document.body.appendChild(svg)

function createPoint(xy, r) {
    let e = document.createElementNS(ns, 'circle')
    e.setAttribute('r', r)
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    return e
}

function createLine(xy0, xy1) {
    let e = document.createElementNS(ns, 'line')
    e.setAttribute('x1', xy0[0])
    e.setAttribute('x2', xy1[0])
    e.setAttribute('y1', xy0[1])
    e.setAttribute('y2', xy1[1])
    return e
}

function drawGraph(graph2d) {
    svg.setAttribute('stroke-width', 0.2 / (graph2d.n + 15))
    let r = 1 / (graph2d.n + 15)
    for (let i = 1; i < graph2d.n; i++) {
        for (let j = 0; j < i; j++) {
            if (graph2d.hasEdge(i, j)) {
                svg.appendChild(createLine(graph2d.xy[i], graph2d.xy[j]))
            }
        }
    }
    for (let i = 0; i < graph2d.n; i++) {
        svg.appendChild(createPoint(graph2d.xy[i], r))
    }
}

function clearSvg() {
    svg.innerHTML = ''
}
