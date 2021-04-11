import {range} from './shortcuts.js'

export class Graph {
    // constructor(nVertices, isDirected)
    // constructor(otherGraph, deepCopy)
    constructor(n, d = false) {
        if (n instanceof Graph) {
            // shallow copy
            Object.assign(this, n)
            if (!d) return
            // deep copy
            this.sets = this.sets.map(x => new Set(x))
            this.invsets = this.isDirected ? this.invsets.map(x => new Set(x)) : this.sets
            this.halfsets = this.halfsets.map(x => new Set(x))
            this.table = this.table.map(x => Array.from(x))
            return
        }
        this.n = n
        this.sets = range(n, _ => new Set())
        this.invsets = d ? range(n, _ => new Set()) : this.sets
        this.halfsets = range(n, _ => new Set())
        this.table = range(n, _ => range(n, 0))

        this.description = 'custom graph'
        this.isDirected = d
        this.name = 'graph'
        this.nDummies = 0
        
        this.lineType = null
        this.coords = null
        this.ids = null
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

    addVertex(isDummy = true) {
        this.n++
        this.sets.push(new Set())
        if (this.isDirected) this.invsets.push(new Set())
        this.halfsets.push(new Set())
        this.table.forEach(row => row.push(0))
        this.table.push(range(this.n, 0))
        if (isDummy) this.nDummies++
        return this.n - 1
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

    iterVertices(f, withDummies = true) {
        let n = this.n
        if (!withDummies) n -= this.nDummies
        for (let a = 0; a < n; a++) f(a)
    }

    iterEdges(f, directed = false) {
        let sets = directed ? this.sets : this.halfsets
        this.iterVertices(a => sets[a].forEach(b => f(a, b)))
    }

    isDummy(a) {
        return a >= this.n - this.nDummies
    }

    getVertexName(a) {
        return this.ids ? this.ids[a] : a.toString()
    }

    copy(deepCopy = true) {
        return new Graph(this, deepCopy)
    }
}
