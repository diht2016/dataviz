
export function graphMiddle(graph) {
    let powers = graph.sets.map(s => s.size)
    let currWave = []
    powers.forEach((p, i) => {
        if (p == 1) currWave.push(i)
    })
    while (currWave.length != 0) {
        let nextWave = []
        for (let u of currWave) {
            for (let v of graph.adjacentOf(u)) {
                if (--powers[v] == 1) {
                    nextWave.push(v)
                }
            }
        }
        if (nextWave.length == 0) return currWave
        currWave = nextWave
    }
}

export function treeHierarchy(graph, root = null) {
    if (root == null) {
        root = graphMiddle(graph)[0]
    }
    let visited = Array(graph.n)
    visited.fill(false)

    function buildNode(u) {
        visited[u] = true
        let children = Array.from(graph.adjacentOf(u))
            .filter(v => !visited[v])
            .map(v => buildNode(v))
        return {
            pos: u,
            children
        }
    }
    return buildNode(root)
}
