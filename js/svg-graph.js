const svgNS = 'http://www.w3.org/2000/svg'
let svg = null
let g = null
let gv = null
let ge = null

let margin = 0.1

export function initSVG() {
    svg = document.createElementNS(svgNS, 'svg')
    setLimits()
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    g = createElem('g', svg)
    ge = createElem('g', g)
    gv = createElem('g', g)

    g.setAttribute('stroke', '#ccc')
    gv.setAttribute('fill', '#fa0')
    ge.setAttribute('fill', 'transparent')

    document.body.appendChild(svg)
    return svg
}

function createElem(tagName, parent) {
    let e = document.createElementNS(svgNS, tagName)
    if (parent) parent.appendChild(e)
    return e
}

function setPoint(e, xy, r) {
    if (!e) e = createElem('circle', gv)
    e.setAttribute('r', r)
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    return e
}

function setLine(e, xy0, xy1, type) {
    if (type) {
        if (!e) e = createElem('path', ge)
        let path = `M ${xy0[0]} ${xy0[1]}`
        if (type == 'verticalCurve') {
            let yd = Math.abs(xy0[1] - xy1[1])
            let dist = 3 * Math.abs(xy0[0] - xy1[0]) + yd
            let t = yd / dist
            let y0 = xy0[1] * t + xy1[1] * (1 - t)
            let y1 = xy1[1] * t + xy0[1] * (1 - t)
            path += ` C ${xy0[0]} ${y0} ${xy1[0]} ${y1} ${xy1[0]} ${xy1[1]}`
        } else if (type == 'polarCurve') {
            let r0 = Math.hypot(xy0[0], xy0[1])
            let r1 = Math.hypot(xy1[0], xy1[1])
            let dist = 3 * Math.hypot(xy0[0] - xy1[0], xy0[1] - xy1[1])
            let t = Math.abs(r0 - r1) / dist
            console.log( Math.abs(r0 - r1), dist, t)
            let k0 = r0 == 0 ? 0 : r1 / r0 * (1 - t) + t
            let k1 = r1 == 0 ? 0 : r0 / r1 * (1 - t) + t
            path += ` C ${k0 * xy0[0]} ${k0 * xy0[1]} ${k1 * xy1[0]} ${k1 * xy1[1]} ${xy1[0]} ${xy1[1]}`
        } else {
            path += ` L ${xy1[0]} ${xy1[1]}`
        }
        e.setAttribute('d', path)
        return e
    } else {
        if (!e) e = createElem('line', ge)
        e.setAttribute('x1', xy0[0])
        e.setAttribute('x2', xy1[0])
        e.setAttribute('y1', xy0[1])
        e.setAttribute('y2', xy1[1])
        return e
    }
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
    g.setAttribute('stroke-width', 0.2 * scale)
    let lineType = graph2d.lineType
    let elems = ge.children
    let i = 0
    graph2d.iterEdges((a, b) => {
        setLine(elems[i++], graph2d.coords[a], graph2d.coords[b], lineType)
    })
    elems = gv.children
    i = 0
    graph2d.iterVertices(a => {
        setPoint(elems[i++], graph2d.coords[a], scale)
    })
}

export function clearGraph() {
    gv.innerHTML = ''
    ge.innerHTML = ''
    currentGraph = null
}
