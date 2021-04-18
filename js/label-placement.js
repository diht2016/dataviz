import {rand} from './shortcuts.js'

function parsePos(str) {
    return str.split(',').map(n => parseInt(n))
}

class Box {
    constructor(pos, size, offsets) {
        this.pos = pos
        this.size = size
        this.offsets = offsets
        this.overlap = this.offsets.map(() => new Set())
        let toRect = (offset) => {
            let x0 = this.pos[0] - offset[0]
            let y0 = this.pos[1] - offset[1]
            return [x0, y0, x0 + this.size[0], y0 + this.size[1]]
        }
        this.rects = this.offsets.map(toRect)
        this.order = null
        this.rids = null
        this.score = 0
        this.chosen = null
    }
}

function parseBox(line) {
    let arr = line.split('\t')
    let pos = parsePos(arr[0])
    let size = parsePos(arr[1])
    let offsets = arr[2].split(' ').map(parsePos)
    return new Box(pos, size, offsets)
}

export function parseBoxes(str) {
    try {
        return str.trim().split('\n').map(parseBox)
    } catch(error) {
        let errorMessage = 'Failed to parse data!'
        alert(errorMessage)
        console.log(errorMessage)
        throw error
    }
}

export function sortBoxesByCoords(boxes) {
    boxes.forEach((box, bi) => box.score = box.pos[0] + box.pos[1] + box.rects.length * 200 + bi * 1e-5)
    boxes.sort((box1, box2) => box1.score - box2.score)
}

function doRectsOverlap(r1, r2) {
    return r1[0] <= r2[2] && r2[0] <= r1[2] && r1[1] <= r2[3] && r2[1] <= r1[3]
}

function isPosInRect(rect, pos) {
    return rect[0] <= pos[0] && rect[1] <= pos[1] && rect[2] >= pos[0] && rect[3] >= pos[1]
}

// How to improve:
// - exclude rects which overlap all of the rects of specific box
// - if after exclusion there is a box with 0 rects, then there's no solution

export function computeOverlaps(boxes) {
    let regs = []
    boxes.forEach((box, bi) => {
        box.rids = []
        box.rects.forEach((rect, ri) => {
            let rid = `${bi}-${ri}`
            for (let reg of regs) {
                if (reg.bi == bi) continue
                if (!doRectsOverlap(rect, reg.rect)) continue
                box.overlap[ri].add(reg.rid)
                reg.box.overlap[reg.ri].add(rid)
            }
            regs.push({bi, ri, box, rect, rid})
            box.rids.push(rid)
        })
    })
    computeRectOrder(boxes)
}

function computeRectOrder(boxes) {
    boxes.forEach(box => {
        let fails = box.rects.map(rect => {
            let count = 0
            boxes.forEach(box2 => {if (isPosInRect(box2.pos, rect)) count++})
            return count - 1
        })
        let order = box.overlap.map((s, i) => [s.size + fails[i] * 100 + i * 1e-5, i])
        order.sort((a, b) => a[0] - b[0])
        box.order = order.map(t => t[1])
    })
}

export class SolverState {
    constructor(boxes) {
        this.boxes = boxes
        this.bi = 0
        this.ris = new Uint8ClampedArray(boxes.length)
        this.placed = new Set()
        this.isDone = this.bi == this.boxes.length
    }

    step() {
        let box = this.boxes[this.bi]
        let ri = box.order[this.ris[this.bi]]
        this.isDone = this.isRollback() ? this.stepRollback() :
            (this.isStepFailed(box, ri) ? this.stepFail() : this.stepSuccess(box, ri))
    }

    isRollback() {
        return this.ris[this.bi] == this.boxes[this.bi].rids.length
    }

    stepRollback() {
        this.ris[this.bi] = 0
        if (--this.bi < 0) return true
        let box = this.boxes[this.bi]
        this.placed.delete(box.rids[box.order[this.ris[this.bi]]])
        return this.stepFail()
    }

    isStepFailed(box, ri) {
        for (let rid of box.overlap[ri]) {
            if (this.placed.has(rid)) return true
        }
        return false
    }

    stepSuccess(box, ri) {
        this.placed.add(box.rids[ri])
        return ++this.bi == this.boxes.length
    }

    stepFail() {
        ++this.ris[this.bi]
        return false
    }

    isSolutionFound() {
        return this.bi == this.boxes.length
    }

    saveChoice() {
        if (!this.isSolutionFound()) return
        this.boxes.forEach((box, bi) => box.chosen = box.order[this.ris[bi]])
    }
}

export function solveSync(boxes) {
    let state = new SolverState(boxes)
    while (!state.isDone) {
        state.step()
    }
    return state
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function solveAsync(boxes) {
    let state = new SolverState(boxes)
    while (true) {
        await stepAsync(state)
        if (state.isDone) break
        sleep(10)
        // draw progress here
    }
    return state
}

async function stepAsync(state, steps = 100) {
    for (let i = 0; i < steps; i++) {
        if (state.isDone) return
        state.step()
    }
}

export function solutionAsText(boxes) {
    let lines = []
    boxes.forEach(box => {
        lines.push(box.pos + '\t' + box.offsets[box.chosen])
    })
    lines.sort()
    return lines.join('\n')
}

export function generatePlacement(mw = 200, mh = 200, tightness = 400, binary = true) {
    let placed = []
    let lines = []
    let padding = 5
    while (tightness > 0) {
        let w = rand(50) + 10
        let h = rand(40) + 10
        let x0 = [padding + rand(mw - w), padding + rand(mh - h)]
        let rect = [x0[0], x0[1], x0[0] + w, x0[1] + h]
        let overlap = false
        for (let placedRect of placed) {
            if (doRectsOverlap(rect, placedRect)) {
                overlap = true
                tightness--
                break
            }
        }
        if (overlap) continue
        placed.push(rect)
        let offsets = []
        let k1 = rand(3) * rand(2) + 1
        let k2 = rand(3) * rand(2) + 1
        for (let j = 0; j <= k1; j++) {
            for (let i = 0; i <= k2; i++) {
                let arr = [i/k2 * w, j/k1 * h]
                if (arr.toString().includes('.')) continue
                offsets.push(arr)
            }
        }
        let chosenIndex = rand(offsets.length)
        let pos = offsets[chosenIndex].map((t, i) => t + x0[i])
        if (binary) {
            let otherIndex = rand(offsets.length - 1)
            if (otherIndex >= chosenIndex) otherIndex++
            offsets = [offsets[chosenIndex], offsets[otherIndex]]
            offsets.sort()
        }
        let line = [pos, [w, h], offsets.join(' ')].join('\t')
        lines.push(line)
    }
    return lines.join('\n')
}
