
function getWavesFromBFS(graph) {
    let waves = []
    let visited = Array(graph.n)
    visited.fill(false)
    for (let i = 0; i < graph.n; i++) {
        if (visited[i]) continue
        let currWave = [i]
        visited[i] = true
        while (currWave.length != 0) {
            let nextWave = []
            for (let u of currWave) {
                for (let v of graph.adjacentOf(u)) {
                    if (visited[v]) continue
                    visited[v] = true
                    nextWave.push(v)
                }
            }
            waves.push(currWave)
            currWave = nextWave
        }
    }
    return waves
}

function collapseWaves(waves, n) {
    let maxWidth = Math.ceil(Math.sqrt(n))
    let newWaves = []
    let collapse = false
    let last = null
    for (let wave of waves) {
        let newCollapse = wave.length == 1
        if (collapse && newCollapse && last.length + wave.length <= maxWidth) {
            let joined = last.concat(wave)
            newWaves[newWaves.length - 1] = joined
            last = joined
        } else {
            newWaves.push(wave)
            last = wave
        }
        collapse = newCollapse
    }
    //console.log(newWaves.map(x => x.join()).join('\n'))
    return newWaves
}

export function hanged(graph, addNoise = false) {
    let waves = getWavesFromBFS(graph)
    waves = collapseWaves(waves, graph.n)
    graph.coords = Array(graph.n)

    let yStep = 1 / waves.length
    let yPos = 0.5 * yStep
    for (let wave of waves) {
        let xStep = 1 / wave.length
        let xPos = 0.5 * xStep
        for (let v of wave) {
            let noise = addNoise ? 1e-5 * yStep * (Math.random() - 0.5) : 0
            graph.coords[v] = [xPos, yPos + noise]
            xPos += xStep
        }
        yPos += yStep
    }
    return graph
}
