let l = []
'a1-a2,a5-a6,a2-a3'
  .split(',')
  .forEach((v, i) => (l[i] = v.split('-').reverse()))
let e = 'a5,a2'.split(',')
let k = []
l.forEach((w) => {
  w.forEach((v, j) => {
    console.log('111', k)
    if (e.indexOf(v) >= 0) {
      console.log('222', k)
      k.push(...w.slice(0, j))
    }
  })
})
if (k.length > 0) {
  console.log(k)
} else {
  console.log(',')
}
