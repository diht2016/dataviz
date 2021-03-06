export let range = (n, f = i => i) => [...Array(n)].map((_, i) => (typeof f == 'function' ? f(i) : f))
//let sum = (arr) => arr.reduce((a, b) => a + b, 0)
export let clone = orig => Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)

export let rand = n => Math.floor(Math.random() * n)
export let chance = p => (Math.random() < p)
