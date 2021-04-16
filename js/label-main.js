import {initSVG, setLabelRects} from "./label-svg.js"
import {parseBoxes, sortBoxesByCoords, computeOverlaps, solveSync, printSolution} from "./label-placement.js"
import {interceptFileDrops, selectFile} from './files.js'

let data = `
45,15	20,10	0,0 20,0 0,10 20,10
50,15	20,10	0,0 20,0 0,10 20,10
25,30	20,10	0,0 20,0 0,10 20,10
30,20	20,10	0,0 20,0 0,10 20,10
55,20	20,10	0,0 20,0 0,10 20,10
40,35	20,10	0,0 20,0 0,10 20,10
45,35	20,10	0,0 20,0 0,10 20,10
`

export function initMain() {
    initSVG()

    interceptFileDrops(readAndSolve)
    selectFile(readAndSolve, '.txt, text/plain') // no controls yet

    readAndSolve(data)
}

function readAndSolve(text) {
    let boxes = parseBoxes(text)
    sortBoxesByCoords(boxes)
    console.time('compute overlaps')
    computeOverlaps(boxes)
    console.timeEnd('compute overlaps')
    setLabelRects(boxes)
    console.time('solve')
    let state = solveSync(boxes)
    console.timeEnd('solve')
    if (!state.isSolutionFound()) {
        alert('No solution found!')
        console.log('No solution found!')
        return
    }
    state.saveChoice()
    printSolution(boxes)
    drawSolution(boxes)
}

function drawSolution(boxes) {
    boxes.forEach(box => {
        box.rectElems.forEach((elem, ri) => {
            if (ri == box.chosen) {
                elem.setColorAndOpacity('#eee', 1)
            } else {
                elem.setColorAndOpacity('#aaa', 0)
            }
        })
    })
}