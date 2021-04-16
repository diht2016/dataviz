import {createSVGRoot, createElem, adjustViewBox} from "./svg-core.js"

let svg = null
let g = null
let gv = null
let gr = null

export function initSVG() {
    svg = createSVGRoot()

    g = createElem('g', svg)
    gr = createElem('g', g)
    gv = createElem('g', g)

    gv.setAttribute('fill', '#fa0')
    gr.setAttribute('stroke', '#ccc')
    gr.setAttribute('fill', 'transparent')

    document.body.appendChild(svg)
    return svg
}

function setOpacity(alpha) {
    this.setAttribute('opacity', alpha)
}

function setColor(color) {
    let attr = this.tagName == 'circle' ? 'fill' : 'stroke'
    this.setAttribute(attr, color)
}

function setColorAndOpacity(color, alpha) {
    this.setColor(color)
    this.setOpacity(alpha)
}

function makeColorable(elem) {
    elem.setColor = setColor
    elem.setOpacity = setOpacity
    elem.setColorAndOpacity = setColorAndOpacity
}

function createPoint(xy, name) {
    let e = createElem('circle', gv)
    if (name) {
        let title = createElem('title', e)
        title.textContent = name
    }
    e.setAttribute('r', '0.5em')
    e.setAttribute('cx', xy[0])
    e.setAttribute('cy', xy[1])
    makeColorable(e)
    return e
}

function createRect(rect) {
    let e = createElem('rect', gr)
    e.setAttribute('x', rect[0])
    e.setAttribute('y', rect[1])
    e.setAttribute('width', rect[2] - rect[0])
    e.setAttribute('height', rect[3] - rect[1])
    makeColorable(e)
    return e
}

function limitsOfBoxes(boxes) {
    let limits = [Infinity, Infinity, -Infinity, -Infinity]
    for (let box of boxes) {
        for (let rect of box.rects) {
            if (limits[0] > rect[0]) limits[0] = rect[0]
            if (limits[1] > rect[1]) limits[1] = rect[1]
            if (limits[2] < rect[2]) limits[2] = rect[2]
            if (limits[3] < rect[3]) limits[3] = rect[3]
        }
    }
    return limits
}

export function setLabelRects(boxes) {
    clearElems()
    adjustViewBox(svg, limitsOfBoxes(boxes))
    let scale = 1.5 // 0.125 * limScale

    g.setAttribute('font-size', scale)
    g.setAttribute('stroke-width', '0.2em')
    for (let box of boxes) {
        box.boxElem = createPoint(box.pos, box.pos.toString())
        box.rectElems = box.rects.map(createRect)
    }
}

export function clearElems() {
    gv.innerHTML = ''
    gr.innerHTML = ''
}
