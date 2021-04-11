import {range} from './shortcuts.js'

export function scatter(graph) {
    graph.coords = range(graph.n, _ => [Math.random(), Math.random()])
    return graph
}

function generateCircleCoords(n) {
    return range(n, _ => {
        let phi = Math.random() * 2 * Math.PI
        let r = Math.sqrt(Math.random()) * 0.5
        return [0.5 + r * Math.cos(phi), 0.5 + r * Math.sin(phi)]
    })
}

export function scatterCircle(graph) {
    graph.coords = generateCircleCoords(graph.n)
    return graph
}
