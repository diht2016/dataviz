
function parsePos(str) {
    return str.split(',').map(n => parseInt(n))
}

class Box {
    constructor(line) {
        let arr = line.split('\t')
        this.pos = parsePos(arr[0])
        this.size = parsePos(arr[1])
        this.offsets = arr[2].split(' ').map(parsePos)
        this.overlap = this.offsets.map(() => new Set())
        let toRect = (offset) => {
            let x0 = this.pos[0] - offset[0]
            let y0 = this.pos[1] - offset[1]
            return [x0, y0, x0 + this.size[0], y0 + this.size[1]]
        }
        this.rects = this.offsets.map(toRect)
        this.rids = null
        this.score = 0
        this.chosen = null
    }
}

function parseBoxes(str) {
    return str.trim().split('\n').map(line => new Box(line))
}

let metric = (pos1, pos2) => Math.hypot(pos1[0] - pos2[0], pos1[1] - pos2[1])

function getCenter(boxes) {
    let center = [0, 0]
    boxes.forEach(box => box.pos.forEach((t, i) => center[i] += t))
    center = center.map(t => t / boxes.length)
}

function sortBoxesFromFurthest(boxes) {
    let center = getCenter(boxes)
    let dists = boxes.map(box => metric(center, box.pos))
    let bestIndex = 0
    let bestScore = Infinity
    dists.forEach((d, bi) => {
        if (bestScore > d) {
            bestIndex = bi
            bestScore = d 
        }
    })
    center = boxes[bestIndex].pos
    boxes.forEach((box, bi) => box.score = metric(center, box.pos) + bi * 1e-5)
    boxes.sort((box1, box2) => box1.score - box2.score)
}

function sortBoxesByCoords(boxes) {
    boxes.forEach((box, bi) => box.score = box.pos[0] + box.pos[1] + bi * 1e-5)
    boxes.sort((box1, box2) => box1.score - box2.score)
}

function doRectsOverlap(r1, r2) {
    return r1[0] <= r2[2] && r2[0] <= r1[2] && r1[1] <= r2[3] && r2[1] <= r1[3]
}

function computeOverlaps(boxes) {
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
}

class SolverState {
    constructor(boxes) {
        this.boxes = boxes
        this.bi = 0
        this.ris = new Uint8ClampedArray(boxes.length)
        this.placed = new Set()
        this.isDone = this.bi == this.boxes.length
    }

    step() {
        let box = this.boxes[this.bi]
        let ri = this.ris[this.bi]
        this.isDone = this.isRollback() ? this.stepRollback() :
            (this.isStepFailed(box, ri) ? this.stepFail() : this.stepSuccess(box, ri))
    }

    isRollback() {
        return this.ris[this.bi] == this.boxes[this.bi].rids.length
    }

    stepRollback() {
        this.ris[this.bi] = 0
        if (--this.bi < 0) return true
        this.placed.delete(this.boxes[this.bi].rids[this.ris[this.bi]])
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

    finalize() {
        if (!isSolutionFound) return
        this.boxes.forEach((box, bi) => box.chosen = this.ris[bi])
    }
}

function solveSync(boxes) {
    let state = new SolverState(boxes)
    while (!state.isDone) {
        state.step()
    }
    return state
}

function printSolution(boxes, state) {
    if (!state.isSolutionFound) {
        console.log("No solution")
        return
    }
    state.ris.forEach((ri, bi) => {
        let box = boxes[bi]
        console.log(box.pos, box.offsets[ri])
    })
}

function readAndSolve(text) {
    let boxes = parseBoxes(text)
    sortBoxesByCoords(boxes)
    console.time('compute overlaps')
    computeOverlaps(boxes)
    console.timeEnd('compute overlaps')
    console.time('solve')
    let state = solveSync(boxes)
    console.timeEnd('solve')
    printSolution(boxes, state)
}

readAndSolve(`
45,15	20,10	0,0 20,0 0,10 20,10
50,15	20,10	0,0 20,0 0,10 20,10
25,30	20,10	0,0 20,0 0,10 20,10
30,20	20,10	0,0 20,0 0,10 20,10
55,20	20,10	0,0 20,0 0,10 20,10
40,35	20,10	0,0 20,0 0,10 20,10
45,35	20,10	0,0 20,0 0,10 20,10
`)