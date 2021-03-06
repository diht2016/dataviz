let range = (n, f) => [...Array(n)].map((_, i) => (typeof f == 'function' ? f(i) : f))
let sum = (arr) => arr.reduce((a, b) => a + b, 0)
let clone = orig => Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)

class UndirectedGraph {
    constructor(n) {
        this.n = n
        this.halfsets = range(n, _ => new Set())
        this.table = range(n, _ => range(n, 0))
        this.powers = Array(n)
        this.powers.fill(0)
    }

    setEdge(a, b) {
        if (this.table[a][b]) return
        this.table[a][b] = 1
        this.table[b][a] = 1
        this.powers[a]++
        this.powers[b]++
        if (a < b) {
            this.halfsets[a].add(b)
        } else {
            this.halfsets[b].add(a)
        }
    }

    hasEdge(a, b) {
        return this.table[a][b]
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

let rand = n => Math.floor(Math.random() * n)
let chance = p => (Math.random() < p)

function randomTree(n = 10) {
    let graph = new UndirectedGraph(n)
    graph.iterVertices(a => graph.setEdge(a, rand(a)))
    return graph
}

function randomGraph(n = 10, p = Math.sqrt(1/n)) {
    let graph = new UndirectedGraph(n)
    graph.iterPairs((a, b) => {if (chance(p)) graph.setEdge(a, b)})
    return graph
}

function pickRandomGraph() {
    let n = chance(0.6) ? rand(10) + 8 : rand(70) + 3
    if (chance(0.8)) {
        let p = Math.pow(1/n, (1 + Math.random()) / 2)
        console.log(`randomGraph(n = ${n}, p = ${p.toFixed(3)})`)
        return randomGraph(n, p)
    } else {
        console.log(`randomTree(n = ${n})`)
        return randomTree(n)
    }
}

function scattered(graph) {
    graph = clone(graph)
    graph.coords = range(graph.n, _ => [Math.random(), Math.random()])
    return graph
}

function scatteredCircle(graph) {
    graph = clone(graph)
    graph.coords = range(graph.n, _ => {
        let phi = Math.random() * 2 * Math.PI
        let r = Math.sqrt(Math.random()) * 0.5
        return [0.5 + r * Math.cos(phi), 0.5 + r * Math.sin(phi)]
    })
    return graph
}
