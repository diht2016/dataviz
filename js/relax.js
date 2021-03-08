let sqrt = Math.sqrt
let min = Math.min
let max = Math.max

let dist2d = xy => sqrt(xy[0] ** 2 + xy[1] ** 2)
let diff2d = (xy1, xy2) => [xy1[0] - xy2[0], xy1[1] - xy2[1]]

function initRelaxFunctions() {
    createFuncInput("fConnected", "d => 0.01 * d", "Connected attraction force")
    createFuncInput("fCrowd", "d => -1 / (0.01 + d**2)", "Eachother attraction force")
    createFuncInput("fCenter", "(d, n) => 0.01 * d**2", "Center attraction force")
    createFuncInput("fPower", "k => min(1, 40/k**2)", "Connections multiplier")
    createFuncInput("fNorm", "d => min(d**0.25, d * 5)", "Speed correction")
    createFuncInput("fScale", "n => sqrt(n) * 5", "Distance scale")
}

function relax(graph2d) {
    let scale = fScale(graph2d.n)
    let newCoords = Array()
    graph2d.iterVertices(a => {
        let axy = graph2d.coords[a]
        let diffCoords = graph2d.coords.map(xy => diff2d(xy, axy))
        let dists = diffCoords.map(xy => dist2d(xy) * scale)
        let nxy = [0, 0]
        let add = (xy, k) => {
            nxy[0] += xy[0] * k
            nxy[1] += xy[1] * k
        }
        let centerDiff = axy.map(t => 1 - t * 2)
        let centerDist = dist2d(centerDiff)
        add(centerDiff, fCenter(centerDist) / centerDist)
        let kConnects = fPower(graph2d.powers[a])
        diffCoords.forEach((xy, i) => {
            let d = dists[i]
            if (!d) return
            add(xy, fCrowd(d) / d)
            if (!graph2d.table[a][i]) return
            add(xy, kConnects * fConnected(d) / d)
        })
        let deltaNorm = dist2d(nxy)
        nxy = nxy.map(t => t * fNorm(deltaNorm * scale) / deltaNorm / scale)
        add(axy, 1)
        newCoords.push(nxy)
    })
    graph2d.coords = newCoords
}
