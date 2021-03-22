import {Graph} from './graph.js'
import {rand, chance} from './shortcuts.js'

export function randomTree(n = 10, directed = false) {
    let graph = new Graph(n, directed)
    let g = -(Math.random() * 3.5 + 0.5)
    let pickPre = a => Math.floor((Math.exp(g*Math.random())-1)/(Math.exp(g)-1)*a)
    graph.iterVertices(a => {if (a) graph.setEdge(pickPre(a), a)})
    graph.description = `randomTree(n = ${n}${directed ? ', directed = true' : ''})`
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
