'use strict'

import {cutter} from './cutter'

function calc(e) {
  e.preventDefault()

  const graph = document.querySelector('#graph')
  graph.innerHTML = ''

  const form = new FormData(document.querySelector('#form'))
  let data = {}, parts = []

  for (let i of form) {
    data[i[0]] = !isNaN(i[1]) && i[1] !== '' ? +i[1] : i[1]
  }

  for (let i = 1; i <= 6; i++) {
    if (data[`length${i}`] === '' || data[`height${i}`] === '' || data[`count${i}`] === '') continue
    const obj = {
      length: data[`length${i}`],
      height: data[`height${i}`],
      count: data[`count${i}`]
    }

    if (data[`name${i}`] !== '') obj.name = data[`name${i}`]
    parts.push(obj)
  }

  data.parts = parts
  data.overLengthFirst = !!data.overLengthFirst
  data.nameIsPrefix = !!data.nameIsPrefix

  const cut = cutter(data),
    errorsBlock = document.querySelector('#errors')

  errorsBlock.innerHTML = ''

  if (cut.errors.length) {
    cut.errors.forEach((e, i) => {
      errorsBlock.innerHTML += `<div>${i}. ${e}</div>`
    })
  } else {
    const length = cut.config.length,
      height = cut.config.height,
      edge = cut.config.edge,
      hem = cut.config.hem

    cut.plates.forEach(item => {
      const canvas = document.createElement('canvas'),
        div = document.createElement('div')
      div.classList.add('plate')

      canvas.setAttribute('width', `${length}`)
      canvas.setAttribute('height', `${height}`)

      const ctx = canvas.getContext('2d')

      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      item.forEach(e => {
        ctx.fillStyle = 'LightSeaGreen'
        ctx.fillRect(e.x, e.y, e.w, e.h)
        ctx.fillStyle = '#000'
        ctx.font = '22px Verdana'
        ctx.fillText(`${e.name} (${e.w}x${e.h}+${edge}+${hem} мм)`, e.x + 10, e.y + 25)
        //кромка
        ctx.fillStyle = 'MediumAquamarine'
        ctx.fillRect(e.x, e.y + e.h, e.w, edge)
        //подгиб
        ctx.fillStyle = 'DarkSeaGreen'
        ctx.fillRect(e.x, e.y + e.h + edge, e.w, hem)
        ctx.strokeRect(e.x, e.y, e.w, e.h + edge + hem)
      })

      div.append(canvas)
      graph.append(div)
    })
  }
}


document.querySelector('#calc').addEventListener('click', e => calc(e))

