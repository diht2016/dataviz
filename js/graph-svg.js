import {createSVGRoot, createElem, adjustViewBox} from "./svg-core.js"

let svg = null
let g = null
let gv = null
let ge = null

export function initSVG() {
    svg = createSVGRoot()
    svg.innerHTML = [
        '<marker id="arrow" viewBox="0 0 10 10"',
        'refX="5" refY="5" fill="#ccc"',
        'markerWidth="4.5" markerHeight="4.5"',
        'orient="auto-start-reverse">',
        '<path d="M 0 0 L 10 5 L 0 10 z" />',
        '</marker>'
    ].join('\n')

    g = createElem('g', svg)
    ge = createElem('g', g)
    gv = createElem('g', g)

    g.setAttribute('stroke', '#ccc')
    gv.setAttribute('fill', '#fa0')
    ge.setAttribute('fill', 'transparent')

    document.body.appendChild(svg)
    return svg
}

function setPoint(e, xy, name) {
    if (!e) {
        e = createElem('circle', gv)
        if (name) {
            let title = createElem('title', e)
            title.textContent = name
        }
    }
    e.setAttribute('r', '0.75em')
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    return e
}

function setLine(e, xy0, xy1, type, directed = false) {
    if (type || directed) {
        if (!e) e = createElem('path', ge)
        let path = `M ${xy0[0]} ${xy0[1]}`
        if (type == 'verticalCurve') {
            // todo: split line when directed
            let yd = Math.abs(xy0[1] - xy1[1])
            let dist = 3 * Math.abs(xy0[0] - xy1[0]) + yd
            let t = yd / dist
            let y0 = xy0[1] * t + xy1[1] * (1 - t)
            let y1 = xy1[1] * t + xy0[1] * (1 - t)
            path += ` C ${xy0[0]} ${y0} ${xy1[0]} ${y1} ${xy1[0]} ${xy1[1]}`
        } else if (type == 'verticalCurveSlight') {
            // todo: split line when directed
            let yd = Math.abs(xy0[1] - xy1[1])
            let dist = 0.3 * Math.abs(xy0[0] - xy1[0]) + yd
            let t = yd / dist
            let y0 = xy0[1] * t + xy1[1] * (1 - t)
            let y1 = xy1[1] * t + xy0[1] * (1 - t)
            let z = 1 - (1 - t) * 0.5
            let x0 = xy0[0] * z + xy1[0] * (1 - z)
            let x1 = xy1[0] * z + xy0[0] * (1 - z)
            path += ` C ${xy0[0]} ${y0} ${xy1[0]} ${y1} ${xy1[0]} ${xy1[1]}`
            //path += ` C ${x0} ${y0} ${x1} ${y1} ${xy1[0]} ${xy1[1]}`
        } else if (type == 'polarCurve') {
            // todo: split line when directed
            let r0 = Math.hypot(xy0[0], xy0[1])
            let r1 = Math.hypot(xy1[0], xy1[1])
            let dist = 3 * Math.hypot(xy0[0] - xy1[0], xy0[1] - xy1[1])
            let t = Math.abs(r0 - r1) / dist
            let k0 = r0 == 0 ? 0 : r1 / r0 * (1 - t) + t
            let k1 = r1 == 0 ? 0 : r0 / r1 * (1 - t) + t
            path += ` C ${k0 * xy0[0]} ${k0 * xy0[1]} ${k1 * xy1[0]} ${k1 * xy1[1]} ${xy1[0]} ${xy1[1]}`
        } else {
            if (directed) {
                let tm = 0.7
                let xm = xy0[0] * (1-tm) + xy1[0] * tm
                let ym = xy0[1] * (1-tm) + xy1[1] * tm
                path += ` L ${xm} ${ym}`
            }
            path += ` L ${xy1[0]} ${xy1[1]}`
        }
        e.setAttribute('d', path)
        if (directed) e.setAttribute('marker-mid', 'url(#arrow)')
    } else {
        if (!e) e = createElem('line', ge)
        e.setAttribute('x1', xy0[0])
        e.setAttribute('x2', xy1[0])
        e.setAttribute('y1', xy0[1])
        e.setAttribute('y2', xy1[1])
    }
    return e
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
    let limScale = adjustViewBox(svg, graph2d.limits)
    let scale = 0.125 * limScale / (graph2d.n) ** 0.625

    // asserting that edges didn't change
    g.setAttribute('font-size', scale)
    g.setAttribute('stroke-width', '0.2em')
    let lineType = graph2d.lineType
    let elems = ge.children
    let i = 0
    graph2d.iterEdges((a, b) => {
        setLine(elems[i++], graph2d.coords[a], graph2d.coords[b], lineType, graph2d.isDirected)
    }, graph2d.isDirected)
    elems = gv.children
    i = 0
    graph2d.iterVertices(a => {
        setPoint(elems[i++], graph2d.coords[a], graph2d.getVertexName(a))
    }, false)
}

export function clearGraph() {
    gv.innerHTML = ''
    ge.innerHTML = ''
    currentGraph = null
}
