import {range} from './shortcuts.js'

export class Graph {
    constructor(n, isDirected = false) {
        this.n = n
        this.sets = range(n, _ => new Set())
        this.halfsets = range(n, _ => new Set())
        this.table = range(n, _ => range(n, 0))

        this.description = 'custom graph'
        this.isDirected = isDirected
        this.lineType = null
        this.name = 'graph'
    }

    setEdge(a, b) {
        if (this.table[a][b]) return
        this.table[a][b] = 1
        this.sets[a].add(b)
        if (!this.isDirected) {
            this.table[b][a] = 1
            this.sets[b].add(a)
        }
        if (a < b) {
            this.halfsets[a].add(b)
        } else {
            this.halfsets[b].add(a)
        }
    }

    removeEdge(a, b) {
        if (!this.table[a][b]) return
        this.table[a][b] = 0
        this.sets[a].delete(b)
        if (!this.isDirected) {
            this.table[b][a] = 0
            this.sets[b].delete(a)
        }
        if (a < b) {
            this.halfsets[a].delete(b)
        } else {
            this.halfsets[b].delete(a)
        }
    }

    hasEdge(a, b) {
        return this.table[a][b]
    }

    hasAnyEdge(a, b) {
        return this.table[a][b] || this.table[b][a]
    }

    adjacentOf(a) {
        return this.sets[a]
    }

    iterPairs(f) {
        for (let b = 1; b < this.n; b++) {
            for (let a = 0; a < b; a++) f(a, b)
        }
    }

    iterVertices(f) {
        for (let a = 0; a < this.n; a++) f(a)
    }

    iterEdges(f, directed = false) {
        let sets = directed ? this.sets : this.halfsets
        this.iterVertices(a => sets[a].forEach(b => f(a, b)))
    }
}
