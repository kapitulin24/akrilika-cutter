'use strict'

import {cutter} from './cutter'

function calc(e) {
  e && e.preventDefault()

  const graph = document.querySelector('#graph')
  graph.innerHTML = ''

  const form = new FormData(document.querySelector('#form'))
  let data = {}, parts = []

  for (let i of form) {
    data[i[0]] = !isNaN(i[1]) && i[1] !== '' ? +i[1] : i[1]
  }

  for (let i = 1; i <= 10; i++) {
    if (data[`length${i}`] === '' || data[`height${i}`] === '' || data[`count${i}`] === '') continue
    const obj = {
      length: data[`length${i}`],
      height: data[`height${i}`],
      count: data[`count${i}`],
      color: data[`color${i}`]
    }

    if (data[`name${i}`] !== '') obj.name = data[`name${i}`]
    parts.push(obj)
  }

  data.parts = parts
  data.overLengthFirst = !!data.overLengthFirst
  data.nameIsPrefix = !!data.nameIsPrefix
  data.rotate = !!data.rotate
  data.cut = !!data.cut

  const cut = cutter(data),
    errorsBlock = document.querySelector('#errors')

  errorsBlock.innerHTML = ''

  if (cut.errors.length) {
    cut.errors.forEach((e, i) => {
      errorsBlock.innerHTML += `<div>${i}. ${e}</div>`
    })
  } else {
    draw(cut)
  }
}

function draw(cut, mode = 'items') {
  graph.innerHTML = ''
  const length = cut.config.length,
    height = cut.config.height,
    edge = mode === 'items' ? cut.config.edge : 0,
    hem = mode === 'items' ? cut.config.hem : 0

  cut.plates.forEach(items => {
    const canvas = document.createElement('canvas'),
      div = document.createElement('div')
    div.classList.add('plate')

    canvas.setAttribute('width', `${length}`)
    canvas.setAttribute('height', `${height}`)

    const ctx = canvas.getContext('2d')

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    items[mode].forEach(e => {
      ctx.fillStyle = e.color || 'LightSeaGreen'
      ctx.fillRect(e.x, e.y, e.w, e.h)
      ctx.fillStyle = '#000'
      ctx.font = '22px Verdana'
      if (e.rotate) {
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${e.name} (${e.h}x${e.w}+${edge}+${hem} мм)`, -e.y - e.h + 10, e.x + 25)
        ctx.rotate(Math.PI / 2)
        //кромка
        ctx.fillStyle = 'MediumAquamarine'
        ctx.fillRect(e.x + e.w, e.y, edge, e.h)
        //подгиб
        ctx.fillStyle = 'DarkSeaGreen'
        ctx.fillRect(e.x + e.w + edge, e.y, hem, e.h)
        ctx.strokeRect(e.x, e.y, e.w + edge + hem, e.h)
      } else if (mode === 'items') {
        ctx.fillText(`${e.name} (${e.w}x${e.h}+${edge}+${hem} мм)`, e.x + 10, e.y + 25)
        //кромка
        ctx.fillStyle = 'MediumAquamarine'
        ctx.fillRect(e.x, e.y + e.h, e.w, edge)
        //подгиб
        ctx.fillStyle = 'DarkSeaGreen'
        ctx.fillRect(e.x, e.y + e.h + edge, e.w, hem)
        ctx.strokeRect(e.x, e.y, e.w, e.h + edge + hem)
      }

      ctx.strokeStyle = 'red'
      ctx.beginPath();
      ctx.setLineDash([30, 10]);
      ctx.moveTo(915, 0);
      ctx.lineTo(915, 760);
      ctx.moveTo(1830, 0);
      ctx.lineTo(1830, 760);
      ctx.moveTo(2745, 0);
      ctx.lineTo(2745, 760);
      ctx.stroke();
      ctx.strokeStyle = 'black'
      ctx.setLineDash([]);
    })

    div.append(canvas)
    graph.append(div)
  })
}

function drawMatrix(cut) {
  graph.innerHTML = ''
  const length = cut.config.length,
    height = cut.config.height

  cut.plates.forEach(items => {
    const canvas = document.createElement('canvas'),
      div = document.createElement('div')
    div.classList.add('plate')

    canvas.setAttribute('width', `${length}`)
    canvas.setAttribute('height', `${height}`)

    const ctx = canvas.getContext('2d')

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'LimeGreen'
    for (let x = 0; x < items.matrix.length; x++) {
      for (let y = 0; y < items.matrix[x].length; y++) {
        items.matrix[x][y] !== 1 && ctx.fillRect(y, x, 1, 1)
      }
    }
    div.append(canvas)
    graph.append(div)
})
}

window.draw = draw
window.drawMatrix = drawMatrix

document.querySelector('#calc').addEventListener('click', e => calc(e))

