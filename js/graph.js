import {range, rand, chance} from './shortcuts.js'

export class Graph {
    constructor(n, isDirected = false) {
        this.n = n
        this.sets = range(n, _ => new Set())
        this.halfsets = range(n, _ => new Set())
        this.table = range(n, _ => range(n, 0))
        this.tableUnordered = isDirected ? range(n, _ => range(n, 0)) : this.table
        this.powers = Array(n)
        this.powers.fill(0)
        this.description = 'custom graph'
        this.isDirected = isDirected
    }

    setEdge(a, b) {
        if (this.table[a][b]) return
        this.table[a][b] = 1
        this.sets[a].add(b)
        this.powers[a]++
        if (!this.isDirected) {
            this.table[b][a] = 1
            this.powers[b]++
            this.sets[b].add(a)
        } else {
            this.tableUnordered[a][b] = 1
            this.tableUnordered[b][a] = 1
        }
        if (a < b) {
            this.halfsets[a].add(b)
        } else {
            this.halfsets[b].add(a)
        }
    }

    hasEdge(a, b) {
        return this.table[a][b]
    }

    adjacentOf(a) {
        return this.sets[a]
    }

    iterPairs(f) {
        for (let b = 1; b < this.n; b++) {
            for (let a = 0; a < b; a++) {
                f(a, b)
            }
        }
    }

    iterVertices(f) {
        for (let a = 0; a < this.n; a++) {
            f(a)
        }
    }

    iterEdges(f) {
        this.iterVertices(a => this.halfsets[a].forEach(b => f(a, b)))
    }
}

export function randomTree(n = 10) {
    let graph = new Graph(n)
    graph.iterVertices(a => graph.setEdge(a, rand(a)))
    graph.description = `randomTree(n = ${n})`
    return graph
}

export function randomGraph(n = 10, p = Math.sqrt(1/n)) {
    let graph = new Graph(n)
    graph.iterPairs((a, b) => {if (chance(p)) graph.setEdge(a, b)})
    graph.description = `randomGraph(n = ${n}, p = ${p.toFixed(3)})`
    return graph
}

export function pickRandomGraph() {
    let n = chance(0.6) ? rand(10) + 8 : rand(70) + 3
    if (chance(0.8)) {
        let p = Math.pow(1/n, (1 + Math.random()) / 2)
        return randomGraph(n, p)
    } else {
        return randomTree(n)
    }
}
