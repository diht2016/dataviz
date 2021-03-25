import {range} from './shortcuts.js'

export class Graph {
    constructor(n, isDirected = false) {
        this.n = n
        this.sets = range(n, _ => new Set())
        this.invsets = isDirected ? range(n, _ => new Set()) : this.sets
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
        this.invsets[b].add(a)
        if (!this.isDirected) {
            this.table[b][a] = 1
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
        this.invsets[b].delete(a)
        if (!this.isDirected) {
            this.table[b][a] = 0
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
