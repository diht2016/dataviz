import {range} from './shortcuts.js'

export function scattered(graph) {
    graph.coords = range(graph.n, _ => [Math.random(), Math.random()])
    return graph
}

export function scatteredCircle(graph) {
    graph.coords = range(graph.n, _ => {
        let phi = Math.random() * 2 * Math.PI
        let r = Math.sqrt(Math.random()) * 0.5
        return [0.5 + r * Math.cos(phi), 0.5 + r * Math.sin(phi)]
    })
    return graph
}
