
export function createFuncInput(name, code, description) {
    setFunc(name, code)
    let funcContainer = document.getElementById('func-inputs')
    if (!funcContainer) return
    let label = document.createTextNode(description + ':')
    let input = document.createElement('input')
    input.type = 'text'
    input.className = 'code-input'
    input.setAttribute('spellcheck', 'false')
    input.setAttribute('autocomplete', 'off')
    input.setAttribute('autocorrect', 'off')
    input.setAttribute('autocapitalize', 'off')
    input.value = code
    input.oninput = function() {
        try {
            setFunc(name, this.value)
            input.classList.remove('error')
        } catch {
            input.classList.add('error')
        }
    }

    funcContainer.appendChild(label)
    funcContainer.appendChild(input)
}

// shortcuts for eval
let sqrt = Math.sqrt
let min = Math.min
let max = Math.max

function setFunc(name, code) {
    let lambda = eval(code) // eval = evil
    let test = lambda(1,1,1,1)
    if (typeof test != 'number' || Number.isNaN(test)) {
        throw TypeError('function should return a number')
    }
    window[name] = lambda
}
