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
      color: data[`color${i}`],
      hem: data[`hem${i}`],
      edge: data[`edge${i}`],
    }

    if (data[`name${i}`] !== '') obj.name = data[`name${i}`]
    parts.push(obj)
  }

  data.parts = parts
  data.nameIsPrefix = !!data.nameIsPrefix
  data.rotate = !!data.rotate
  data.cut = !!data.cut
  data.axisX = !!data.axisX
  data.getAllData = true //для дебага
  data.prepareOutputPlates = false //для дебага

  const cut = cutter(data),
    errorsBlock = document.querySelector('#errors')

  document.querySelector('#time').innerText = `${cut.statistic.time} cек. ${cut.statistic.countOfParts} частей. ${cut.statistic.countOfPlates} листов.  ${cut.statistic.totalLength}мм общая длина.`
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
        axisX = cut.config.axisX


  cut.plates.forEach(items => {
    const canvas = document.createElement('canvas'),
          div = document.createElement('div')

    div.classList.add('plate')

    canvas.setAttribute('width', `${length}`)
    canvas.setAttribute('height', `${height}`)

    const ctx = canvas.getContext('2d')

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    items[mode].forEach(e => {
      const edge = mode === 'items' ? e.edge : 0,
            hem = mode === 'items' ? e.hem : 0,
            eh = edge + hem

      let w = e.w, h = e.h, x = e.x, y = e.y
      if (e.rotate) [w, h] = [h, w]
      ctx.fillStyle = e.color || 'LightSeaGreen'
      ctx.fillRect(x, y, w, h)
      ctx.fillStyle = '#000'
      ctx.font = '22px Verdana'
      if (e.rotate) {
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${e.name} (${h}x${w}+${edge}+${hem} мм)`, -y - h + 10, x + 25)
        ctx.rotate(Math.PI / 2)
        //кромка
        ctx.fillStyle = 'MediumAquamarine'
        ctx.fillRect(x + w - eh, y, edge, h)
        //подгиб
        ctx.fillStyle = 'DarkSeaGreen'
        ctx.fillRect(x + w - hem, y, hem, h)
        ctx.strokeRect(x, y, w, h)
      } else if (mode === 'items') {
        ctx.fillText(`${e.name} (${w}x${h}+${edge}+${hem} мм)`, x + 10, y + 25)
        //кромка
        ctx.fillStyle = 'MediumAquamarine'
        ctx.fillRect(x, y + h - eh, w, edge)
        //подгиб
        ctx.fillStyle = 'DarkSeaGreen'
        ctx.fillRect(x, y + h - hem, w, hem)
        ctx.strokeRect(x, y, w, h)
      }
    })

    ctx.strokeStyle = 'red'
    ctx.beginPath();
    ctx.setLineDash([30, 10]);
    if (axisX) {
      const size = Math.round(length / 4)

      ctx.moveTo(size, 0);
      ctx.lineTo(size, height);
      ctx.moveTo(size * 2, 0);
      ctx.lineTo(size * 2, height);
      ctx.moveTo(size * 3, 0);
      ctx.lineTo(size * 3, height);
    } else {
      const size = Math.round(height / 2)

      ctx.moveTo(0, size);
      ctx.lineTo(length, size);
    }
    ctx.stroke();
    ctx.strokeStyle = 'black'
    ctx.setLineDash([]);

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
        items.matrix[x][y] !== 1 && items.matrix[x][y] !== 4 && ctx.fillRect(y, x, 1, 1)
      }
    }
    div.append(canvas)
    graph.append(div)
})
}

function drawUnusedAll(cut) {
  graph.innerHTML = ''
  const length = cut.config.length,
    height = cut.config.height

  for (let item = 0; item < cut.plates.length; item++) {
    const canvas = document.createElement('canvas'),
      div = document.createElement('div')
    div.classList.add('plate')

    canvas.setAttribute('width', `${length}`)
    canvas.setAttribute('height', `${height}`)

    const ctx = canvas.getContext('2d')

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    cut.unusedRectAll.filter(e => e.fromPlate === item).forEach(items => {
      ctx.fillStyle = 'Aqua'
      ctx.fillRect(items.x, items.y, items.w, items.h)
    })

    div.append(canvas)
    graph.append(div)
  }
}

window.draw = draw
window.drawMatrix = drawMatrix
window.drawUnusedAll = drawUnusedAll

document.querySelector('#calc').addEventListener('click', e => calc(e))

