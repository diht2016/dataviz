export function transitiveReduction(graph) {
    graph.iterVertices(u => {
        let decay = w => {
            graph.removeEdge(u, w)
            graph.adjacentOf(w).forEach(decay)
        }
        Array.from(graph.adjacentOf(u)).forEach(v => {
            if (!graph.hasEdge(u, v)) return
            graph.adjacentOf(v).forEach(decay)
        })
    })
}

function getWavesFromBFS(graph) {
    let nParents = Array(graph.n)
    nParents.fill(0)
    graph.sets.forEach(s => s.forEach(b => nParents[b]++))
    let waves = []
    let currWave = []
    nParents.forEach((n, i) => {if (n == 0) currWave.push(i)})
    while (currWave.length != 0) {
        let nextWave = []
        for (let u of currWave) {
            for (let v of graph.adjacentOf(u)) {
                if (--nParents[v] == 0) {
                    nextWave.push(v)
                }
            }
        }
        waves.push(currWave)
        currWave = nextWave
    }
    return waves
}

export function flowHanged(graph) {
    let waves = getWavesFromBFS(graph)
    graph.coords = Array(graph.n)

    let yStep = 1 / waves.length
    let yPos = 0.5 * yStep
    let maxWidth = waves.map(w => w.length).reduce((a, b) => Math.max(a, b), 0)
    for (let wave of waves) {
        let xStep = 1 / maxWidth
        let xPos = 0.5 * (maxWidth - wave.length + 1) * xStep
        for (let v of wave) {
            graph.coords[v] = [xPos, yPos]
            xPos += xStep
        }
        yPos += yStep
    }
    return graph
}
