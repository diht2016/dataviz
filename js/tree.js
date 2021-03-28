
export function graphMiddle(graph) {
    // will work only on tree graphs
    // todo: make it work on any graphs
    if (graph.n == 1) return [0]
    let powers = graph.sets.map(s => s.size)
    let currWave = []
    powers.forEach((p, i) => {
        if (p == 1) currWave.push(i)
    })
    while (currWave.length != 0) {
        let nextWave = []
        for (let u of currWave) {
            for (let v of graph.sets[u]) {
                if (--powers[v] == 1) {
                    nextWave.push(v)
                }
            }
        }
        if (nextWave.length == 0) return currWave
        currWave = nextWave
    }
}

export function treeHanged(graph, radial = false, roots = null) {
    if (roots == null) {
        if (!graph.isDirected) {
            roots = [graphMiddle(graph)[0]]
        } else {
            roots = []
            graph.invsets.forEach((s, i) => {
                if (s.size == 0) roots.push(i)
            })
        }
    }
    let visited = Array(graph.n)
    visited.fill(false)
    // fact: in radial graphs value of globalStep does not matter at all
    let globalStep = radial ? 1 : 0.8

    function mergeTwoHulls(hull, lhull, rhull, step) {
        let dist = 0
        let depth = Math.min(lhull[0].length, rhull[0].length)
        // compute distance between subtrees
        for (let h = 0; h < depth; h++) {
            let currDist = lhull[1][h] - rhull[0][h]
            if (dist < currDist) dist = currDist
        }
        dist += step
        // merge two hulls
        hull[0] = lhull[0].concat(rhull[0].slice(lhull[0].length).map(x => x + dist))
        hull[1] = rhull[1].map(x => x + dist).concat(lhull[1].slice(rhull[1].length))
        return dist
    }

    function joinTrees(nodes, h) {
        if (nodes.length == 0) {
            return [[0], [0]]
        }
        // it is ok to merge everything from left to right,
        // but merge is not associative: ((Ab)C) != (A(bC))
        // if b is small enough, so it sticks to the piece
        // it is merging first, that's why it is better to
        // start from the middle, so small pieces will now
        // tend to stick to the center, not to the sides.
        let middle = Math.floor(nodes.length / 2)
        let hull = nodes[middle].hull
        let step = radial ? globalStep / (h + 1) : globalStep
        // merge all from right
        let rdist = 0
        for (let i = middle + 1; i < nodes.length; i++) {
            let r = nodes[i]
            rdist = mergeTwoHulls(hull, hull, r.hull, step)
            r.offset = rdist
        }
        // merge all from left
        let ldist = 0
        for (let i = middle - 1; i >= 0; i--) {
            let l = nodes[i]
            ldist -= mergeTwoHulls(hull, l.hull, hull, step)
            l.offset = ldist
        }

        // shift to center
        let center = (rdist + ldist) / 2
        let shift = (rdist - ldist) / 2
        hull = hull.map(half => {
            let newHalf = half.map(x => x - shift)
            newHalf.unshift(0)
            return newHalf
        })
        nodes.forEach(c => {
            c.offset -= center
            c.hull = null // hull no longer needed
        })
        return hull
    }

    function buildNode(u, h) {
        visited[u] = true
        let children = Array.from(graph.sets[u])
            .filter(v => !visited[v])
            .map(v => buildNode(v, h + 1))
        
        let hull = joinTrees(children, h)

        return {
            index: u,
            offset: 0,
            hull,
            children
        }
    }

    function computeCoords(node, x, y) {
        x += node.offset
        graph.coords[node.index] = [x, y]
        let step2 = 0.5 * (!radial || y == 0 ? globalStep : globalStep / y)
        graph.limits[0] = Math.min(graph.limits[0], x - step2)
        graph.limits[2] = Math.max(graph.limits[2], x + step2)
        graph.limits[3] = Math.max(graph.limits[3], y)
        y += 1
        node.children.forEach(c => computeCoords(c, x, y))
    }

    graph.coords = Array(graph.n)
    graph.limits = [0, 0, 0, 0]
    if (roots.length == 1) {
        let rootNode = buildNode(roots[0], 0)
        computeCoords(rootNode, 0, 0)
    } else {
        let y = radial ? 1 : 0
        let rootNodes = roots.map(root => buildNode(root, y))
        joinTrees(rootNodes, 0)
        rootNodes.forEach(rootNode => computeCoords(rootNode, 0, y))
    }

    graph.lineType = 'verticalCurve'
    if (radial) graph = toPolar(graph)
    return graph
}

export function toPolar(graph) {
    graph.coords = graph.coords.map(xy => {
        if (xy[1] == 0) return [0, 0]
        let phi = xy[0] / (graph.limits[2] - graph.limits[0]) * 2 * Math.PI
        let r = xy[1] / graph.limits[3]
        return [-r * Math.sin(phi), -r * Math.cos(phi)]
    })
    graph.limits = [-1, -1, 1, 1]
    graph.lineType = 'polarCurve'
    return graph
}
