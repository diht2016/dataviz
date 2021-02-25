let range = (n, f) => [...Array(n)].map((_, i) => f(i))
let clone = orig => Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)

class UndorderedGraph {
    constructor(n) {
        this.n = n
        this.edges = range(n, _ => Array())
    }

    addEdge(a, b) {
        this.edges[a].push(b)
        this.edges[b].push(a)
    }

    hasEdge(a, b) {
        return this.edges[a].includes(b)
    }
}

let rand = n => Math.floor(Math.random() * n)
let chance = p => (Math.random() < p)

function randomTree(n = 10) {
    let graph = new UndorderedGraph(n)
    for (let i = 1; i < n; i++) {
        graph.addEdge(i, rand(i))
    }
    return graph
}

function randomGraph(n = 10, p = Math.sqrt(1/n)) {
    let graph = new UndorderedGraph(n)
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (chance(p)) {
                graph.addEdge(i, j)
            }
        }
    }
    return graph
}

function scattered(graph) {
    graph = clone(graph)
    graph.xy = range(graph.n, _ => [Math.random(), Math.random()])
    return graph
}