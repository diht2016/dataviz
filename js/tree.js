
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

export function treeHanged(graph, radial = false, root = null) {
    if (root == null) {
        if (!graph.isDirected) {
            root = graphMiddle(graph)[0]
        } else {
            let invPowers = Array(graph.n)
            invPowers.fill(0)
            graph.sets.forEach(s => s.forEach(b => invPowers[b]++))
            root = invPowers.indexOf(0)
            //root = graph.sets.map(s => s.size).indexOf(0)
        }
    }
    let visited = Array(graph.n)
    visited.fill(false)
    // fact: in radial graphs value of globalStep does not matter at all
    let globalStep = radial ? 1 : 0.8

    function mergeHulls(hull, lhull, rhull, step) {
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

    function buildNode(u, h) {
        visited[u] = true
        let children = Array.from(graph.adjacentOf(u))
            .filter(v => !visited[v])
            .map(v => buildNode(v, h + 1))
        
        if (children.length == 0) {
            return {
                index: u,
                offset: 0,
                hull: [[0], [0]],
                children
            }
        }

        // it is ok to merge everything from left to right,
        // but merge is not associative: ((Ab)C) != (A(bC))
        // if b is small enough, so it sticks to the piece
        // it is merging first, that's why it is better to
        // start from the middle, so small pieces will now
        // tend to stick to the center, not to the sides.
        let middle = Math.floor(children.length / 2)
        let hull = children[middle].hull
        let step = radial ? globalStep / (h + 1) : globalStep
        // merge all from right
        let rdist = 0
        for (let i = middle + 1; i < children.length; i++) {
            let r = children[i]
            rdist = mergeHulls(hull, hull, r.hull, step)
            r.offset = rdist
        }
        // merge all from left
        let ldist = 0
        for (let i = middle - 1; i >= 0; i--) {
            let l = children[i]
            ldist -= mergeHulls(hull, l.hull, hull, step)
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
        children.forEach(c => {
            c.offset -= center
            c.hull = null
        })

        return {
            index: u,
            offset: 0,
            hull,
            children
        }
    }

    let rootNode = buildNode(root, 0)
    graph.coords = Array(graph.n)
    graph.limits = [0, 0, 0, 0]

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
    computeCoords(rootNode, 0, 0)

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
