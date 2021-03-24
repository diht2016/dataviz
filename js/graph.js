import {range} from './shortcuts.js'

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
        this.lineType = null
        this.useLineType = true
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

    removeEdge(a, b) {
        if (!this.table[a][b]) return
        this.table[a][b] = 0
        this.sets[a].delete(b)
        this.powers[a]--
        if (!this.isDirected) {
            this.table[b][a] = 0
            this.powers[b]--
            this.sets[b].delete(a)
        } else {
            this.tableUnordered[a][b] = this.table[b][a]
            this.tableUnordered[b][a] = this.table[b][a]
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

    iterEdges(f, directed = false) {
        this.iterVertices(a => this.halfsets[a].forEach(b => {
            if (directed) {
                if (this.table[a][b]) f(a, b)
                if (this.table[b][a]) f(b, a)
            } else {
                f(a, b)
            }
        }))
    }
}
