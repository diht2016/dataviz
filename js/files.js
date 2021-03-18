
export function interceptFileDrops(callback, readContents = true) {
    function interceptEvent(e) {
        e.stopPropagation()
        e.preventDefault()
    }
    
    function dropFile(e) {
        interceptEvent(e)
        runCallback(e.dataTransfer.files, callback, readContents)
    }
    
    window.ondrop = dropFile
    window.ondragover = interceptEvent
}

export function selectFile(callback, extMask = undefined, readContents = true) {
	let input = document.createElement('input')
	input.type = 'file'
	input.accept = extMask
	input.style.opacity = '0'
	input.style.position = 'fixed'
	input.style.top = '0'
	input.style.left = '0'
	document.body.appendChild(input)
	input.click()
	input.onchange = function() {
        runCallback(input.files, callback, readContents)
	}
	document.body.addEventListener('focusin', function() {
		document.body.removeChild(input)
	}, {once: true})
}

function runCallback(files, callback, readContents) {
    if (!files || !files[0]) return
    if (readContents) {
        getFileContents(files[0], callback)
    } else {
        callback(files)
    }
}

export function getFileContents(file, contentCallback) {
	let reader = new FileReader()
	reader.onerror = () => alert('File reading failed!')
	reader.onload = () => contentCallback(reader.result)
	reader.readAsBinaryString(file)
}

export function dataToLink(mime, data) {
    return `data:${mime};base64,${btoa(data)}`
}

export function downloadFile(name, mime, data) {
	let a = document.createElement('a')
    let link = dataToLink(mime, data)
	a.href = link
	a.target = '_blank'
	a.download = name
	a.style.opacity = '0'
	a.style.position = 'fixed'
	document.body.appendChild(a)
	try {
		a.click()
	} catch(error) {}
	document.body.removeChild(a)
}
