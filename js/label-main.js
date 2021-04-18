import {initSVG, setLabelRects} from "./label-svg.js"
import {parseBoxes, sortBoxesByCoords, computeOverlaps, solveSync, solutionAsText, generatePlacement} from "./label-placement.js"
import {interceptFileDrops, selectFile} from './files.js'

export function initMain() {
    initSVG()

    interceptFileDrops(readAndSolve)
}

function readAndSolve(text) {
    let boxes = parseBoxes(text)
    sortBoxesByCoords(boxes)
    console.time('compute overlaps')
    computeOverlaps(boxes)
    console.timeEnd('compute overlaps')
    setLabelRects(boxes)
    solve(boxes)
}

function solve(boxes) {
    console.time('solve')
    //let state = await solveAsync(boxes)
    let state = solveSync(boxes)
    console.timeEnd('solve')
    if (!state.isSolutionFound()) {
        alert('No solution found!')
        console.log('No solution found!')
        return
    }
    state.saveChoice()
    console.log(solutionAsText(boxes))
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

export function processSample(sampleName) {
    fetch('/samples/label-placement/' + sampleName)
        .then(res => res.text().then(readAndSolve))
}

export function selectFileAndProcess() {
    selectFile(readAndSolve, '.txt, text/plain')
}

export function processRandom() {
    let data = generatePlacement()
    console.log(data)
    readAndSolve(data)
}
