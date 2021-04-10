import {range} from './shortcuts.js'

export function transitiveReduction(graph) {
    graph.iterVertices(u => {
        let decay = w => {
            graph.removeEdge(u, w)
            graph.sets[w].forEach(decay)
        }
        Array.from(graph.sets[u]).forEach(v => {
            if (!graph.hasEdge(u, v)) return
            graph.sets[v].forEach(decay)
        })
    })
}

function buildLayers(graph, addDummies = true) {
    let minLayer = range(graph.n, graph.n)
    function limitMin(u, n) {
        if (minLayer[u] <= n) return
        minLayer[u] = n
        n--
        graph.invsets[u].forEach(v => limitMin(v, n))
    }

    let maxLayer = range(graph.n, -1)
    function limitMax(u, n) {
        if (maxLayer[u] >= n) return
        maxLayer[u] = n
        n++
        graph.sets[u].forEach(v => limitMax(v, n))
    }

    let powersIn = graph.invsets.map(s => s.size)
    powersIn.forEach((n, i) => {if (n == 0) limitMax(i, 0)})
    let bottom = maxLayer.reduce((a, b) => Math.max(a, b), 0)
    let powersOut = graph.sets.map(s => s.size)
    powersOut.forEach((n, i) => {if (n == 0) limitMin(i, bottom)})
    let isFixed = u => minLayer[u] == maxLayer[u]
    
    function forceFix(u) {
        if (isFixed(u)) return
        let min = minLayer[u]
        let max = maxLayer[u]
        let downScore = 0
        for (let v of graph.sets[u]) {
            if (isFixed(v)) downScore++
        }
        for (let v of graph.invsets[u]) {
            if (isFixed(v)) downScore--
        }
        if (downScore > 0) {
            limitMax(u, min)
        } else if (downScore < 0) {
            limitMin(u, max)
        } else {
            let middle = Math.floor((min + max) / 2)
            limitMax(u, middle)
            limitMin(u, middle)
        }
    }

    let lvls = range(bottom + 1, () => [])
    let queue = []
    let added = range(graph.n, u => isFixed(u))
    added.forEach((b, u) => {if (b) queue.push(u)})
    function enqueue(u) {
        if (added[u]) return
        added[u] = true
        queue.push(u)
    }
    function collect(u) {
        graph.sets[u].forEach(enqueue)
        graph.invsets[u].forEach(enqueue)
        lvls[maxLayer[u]].push(u)
    }

    while (true) {
        for (let u of queue) {
            forceFix(u)
            collect(u)
        }
        let unfinished = added.indexOf(false)
        if (unfinished == -1) break
        queue = [unfinished]
        added[unfinished] = true
    }

    if (addDummies) addDummyVertices(graph, lvls, maxLayer)
    return lvls
}

function addDummyVertices(graph, lvls, depths) {
    graph.iterVertices(u => {
        let parents = Array.from(graph.invsets[u])
        for (let v of parents) {
            if (depths[u] - depths[v] > 1) {
                graph.removeEdge(v, u)
                let prev = v
                for (let d = depths[v] + 1; d < depths[u]; d++) {
                    let curr = graph.addVertex()
                    graph.setEdge(prev, curr)
                    lvls[d].push(curr)
                    prev = curr
                }
                graph.setEdge(prev, u)
            }
        }
    }, false)
}

function coordMinimizer(curr, base, sets) {
    let coords = curr.map((u, i) => {
        let selfW = 0.1
        let pos = selfW * (i + 0.5) / curr.length
        let w = selfW + sets[u].size
        for (let v of sets[u]) {
            let index = base.indexOf(v)
            if (index != -1) pos += (index + 0.5) / base.length
        }
        return [pos / w, u]
    })
    coords.sort((a, b) => a[0] - b[0])
    let lvl = coords.map(t => t[1])
    return lvl
}

function crossMinimizer(curr, base, sets) {
    const maxScope = 4
    for (let i = 0; i < curr.length; i++) {
        let lim = Math.min(i + maxScope, curr.length)
        for (let j = i + 1; j < lim; j++) {
            let u1 = curr[i]
            let u2 = curr[j]
            let swapScore = 0
            let count1 = 0
            let count2 = 0
            for (let v of base) {
                let h1 = +sets[u1].has(v)
                let h2 = +sets[u2].has(v)
                swapScore += h1 * count2 - h2 * count1
                count1 += h1
                count2 += h2
            }
            if (swapScore > 0) {
                curr[i] = u2
                curr[j] = u1
            }
        }
    }
    return curr
}

function minimizeEdgeCrossing(graph, lvls, minimizer, nTimes = 2) {
    for (let i = 0; i < nTimes; i++) {
        for (let d = 1; d < lvls.length; d++) {
            lvls[d] = minimizer(lvls[d], lvls[d - 1], graph.invsets)
        }
        for (let d = lvls.length - 1; d > 0; d--) {
            lvls[d - 1] = minimizer(lvls[d - 1], lvls[d], graph.sets)
        }
    }
}

function setGraphCoords(graph, lvls) {
    let coords = Array(graph.n)

    let w2 = 0
    const wVertex = 1
    const wDummy = 0.25
    let yPos = 0.5
    for (let lvl of lvls) {
        let w2Local = lvl
            .map(u => graph.isDummy(u) ? wDummy : wVertex)
            .reduce((a, b) => a + b) / 2
        if (w2 < w2Local) w2 = w2Local
        let xPos = -w2Local
        for (let u of lvl) {
            let step2 = (graph.isDummy(u) ? wDummy : wVertex) / 2
            xPos += step2
            coords[u] = [xPos, yPos]
            xPos += step2
        }
        yPos += 1
    }

    graph.coords = coords
    graph.limits = [-w2, 0, w2, lvls.length]
}

export function flowHanged(graph, addDummies = true) {
    graph = graph.copy()
    let lvls = buildLayers(graph, addDummies)
    minimizeEdgeCrossing(graph, lvls, coordMinimizer)
    minimizeEdgeCrossing(graph, lvls, crossMinimizer)
    setGraphCoords(graph, lvls)
    //graph.lineType = 'verticalCurveSlight'
    return graph
}
