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

function getWavesFromBFS(graph) {
    let score = Array(graph.n)
    score.fill(0)

    let minLayer = Array(graph.n)
    minLayer.fill(graph.n)
    function limitMin(u, n) {
        if (minLayer[u] <= n) return
        minLayer[u] = n
        n--
        graph.invsets[u].forEach(v => limitMin(v, n))
    }

    let maxLayer = Array(graph.n)
    maxLayer.fill(-1)
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
    
    function forceFix(u, strict) {
        let min = minLayer[u]
        let max = maxLayer[u]
        console.log(u, min, max)
        if (min == max) return
        let uScore = powersIn[u]
        let dScore = powersOut[u]
        console.log(u, uScore, dScore)
        if (dScore > uScore) {
            limitMax(u, min)
        } else if (uScore > dScore) {
            limitMin(u, max)
        } else if (strict) {
            let middle = Math.floor((min + max) / 2)
            limitMax(u, middle)
            limitMin(u, middle)
        } else return false
        console.log(u, minLayer[u])
        return true
    }

    let added = Array(graph.n)
    added.fill(false)
    let waves = range(bottom + 1, () => [])
    graph.iterVertices(u => {
        if (forceFix(u, false)) {
            waves[maxLayer[u]].push(u)
            added[u] = true
        }
    })
    graph.iterVertices(u => {
        if (!added[u]) {
            forceFix(u, true)
            waves[maxLayer[u]].push(u)
        }
    })
    return waves
}

export function flowHanged(graph) {
    let waves = getWavesFromBFS(graph)
    graph.coords = Array(graph.n)

    let width = waves.map(w => w.length).reduce((a, b) => Math.max(a, b), 0)
    let height = waves.length

    //let noise = () => 0.5 * (Math.random() - 0.5)
    let yPos = 0.5
    for (let wave of waves) {
        let xPos = 0.5 * (width - wave.length + 1)
        for (let v of wave) {
            graph.coords[v] = [xPos, yPos]
            xPos += 1
        }
        yPos += 1
    }
    graph.limits = [0, 0, width, height]
    return graph
}
