const svgNS = 'http://www.w3.org/2000/svg'

export function createSVGRoot() {
    let svgRoot = document.createElementNS(svgNS, 'svg')
    // xmlns is needed for correct display as image when downloaded
    svgRoot.setAttribute('xmlns', svgNS)
    adjustViewBox(svgRoot)
    svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    return svgRoot
}

export function createElem(tagName, parent) {
    let elem = document.createElementNS(svgNS, tagName)
    if (parent) parent.appendChild(elem)
    return elem
}

const defaultLimits = [0, 0, 1, 1]
const margin = 0.1

export function adjustViewBox(svgRoot, limits) {
    if (!limits) limits = defaultLimits // use default even when limits = null
    let w = limits[2] - limits[0]
    let h = limits[3] - limits[1]
    let xm = margin * Math.max(w, 0.5)
    let ym = margin * Math.max(h, 0.5)
    let view = [limits[0] - xm, limits[1] - ym, w + 2 * xm, h + 2 * ym]
    svgRoot.setAttribute('viewBox', view.join(' '))
    return Math.hypot(view[2], view[3])
}

