
export function graphMiddle(graph) {
    if (graph.n == 1) return [0]
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

export function treeHanged(graph, root = null) {
    if (root == null) {
        root = graphMiddle(graph)[0]
    }
    let visited = Array(graph.n)
    visited.fill(false)
    let step = 0.8

    function buildNode(u) {
        visited[u] = true
        let children = Array.from(graph.adjacentOf(u))
            .filter(v => !visited[v])
            .map(v => buildNode(v))
        let hull = null
        if (children.length == 0) {
            hull = [[0], [0]]
        } else {
            hull = children[0].hull
            let dist = 0
            for (let i = 1; i < children.length; i++) {
                let r = children[i]
                // compute distance between subtrees
                let depth = Math.min(hull[0].length, r.hull[0].length)
                for (let h = 0; h < depth; h++) {
                    let currDist = hull[1][h] - r.hull[0][h]
                    if (dist < currDist) dist = currDist
                }
                dist += step
                // merge two hulls
                hull[0] = hull[0].concat(r.hull[0].slice(hull[0].length).map(x => x + dist))
                hull[1] = r.hull[1].map(x => x + dist).concat(hull[1].slice(r.hull[1].length))
                r.offset = dist
            }
            // shift to center
            let middle = dist / 2
            hull = hull.map(half => {
                let newHalf = half.map(x => x - middle)
                newHalf.unshift(0)
                return newHalf
            })
            children.forEach(c => {
                c.offset -= middle
                c.hull = null
            })
        }
        return {
            index: u,
            offset: 0,
            hull,
            children
        }
    }

    let rootNode = buildNode(root)
    graph.coords = Array(graph.n)
    graph.limits = [0, 0, 0, 0]

    function computeCoords(node, x, y) {
        x += node.offset
        graph.coords[node.index] = [x, y]
        graph.limits[0] = Math.min(graph.limits[0], x)
        graph.limits[2] = Math.max(graph.limits[2], x)
        graph.limits[3] = Math.max(graph.limits[3], y)
        y += 1
        node.children.forEach(c => computeCoords(c, x, y))
    }

    computeCoords(rootNode, 0, 0)
    return graph
}
