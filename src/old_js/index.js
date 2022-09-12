'use strict'

import {LinearCutter} from './components/LinearCutter'

function cutter(param) {
  const {
    parts: parts = [], //{length: 12, height: 500, count: 1}
    length: length = 3660,
    height: height = 760,
    maxHeight: maxHeight = height,
    maxLength: maxLength = length * 2,
    step: step = 0.5,
    edge: edge = 40,
    hem: hem = 40,
  } = param
  const data = {
    groupsOverlenght: {},
    result: {},
    cutOfRemain: {},
    plates: [],
    unusedRectangle: {}
  }
  //validation
  if ([length, height, maxHeight, maxLength, edge, hem].some(e => !Number.isInteger(e) || e <= 0)) {
    throw new Error(`Element is not integer`)
  }
  data.notValidElements = parts.filter(part => part.length > maxLength || part.height > maxHeight)
  if (data['notValidElements'].length) {
    throw new Error(`Elements: ${JSON.stringify(data.notValidElements)} is not valid`)
  }
  if (Number.isNaN(step) || step <= 0 || step > 1) {
    throw new Error(`Step error`)
  }
  if (parts.filter(e => (
      !e.length || !e.height || !e.count ||
      !Number.isInteger(e.length) || !Number.isInteger(e.height) || !Number.isInteger(e.count) ||
      e.length <= 0 || e.height <= 0 || e.count <= 0
    )
  ).length) {
    throw new Error(`parts is not type: {length: Integer > 0, height: Integer > 0, count: Integer > 0}`)
  }
  if (typeof cutParam !== 'object') {
    throw new Error(`cutParam is not Object`)
  }

  //отделяем отрезки больше длины заготовки
  for (let part = 0; part < parts.length; part++) {
    if (parts[part].length > length) {
      data.groupsOverlenght[+parts[part].height] = parts[part]
      parts.splice(part, 1)
      part--
    }
  }

  //сортировка по убыванию
  data.parts = Object.keys(parts).sort((a, b) => b.length - a.length)

  let count = 0

  //кроим по рядам
  data.sortHeights.forEach(height => {
    const cutting = new LinearCutter({
      parts: data.groupsHeight[height],
      stocks: data.stocks,
      ...cutParam
    })

    cutting.init()
    const cutRes = cutting.getResult()

    //удаляем из заготовок если она была использована
    cutRes.used.forEach(item => {
      if (item.length !== length) {
        const index = data.stocks.findIndex(e => e.length === item.length)
        if (index > -1) {
          data.stocks[index].count -= item.count
          if (data.stocks[index].count === 0) {
            data.stocks.splice(index, 1)
          }
        }
      }
    })

    cutRes.list.forEach(item => {
      const remain = item.remain.total.length

      data.stocks.push({length: remain, count: item.count}) //остатки отдаем снова в заготовки

      for (let i = 0; i < item.count; i++) {
        data.result[`${height}_${remain}_${item.length}_${++count}`] = item.cut.map((w, index) => {
          let x = 0

          for (let i in item.cut) {
            if (i < index) {
              x += item.cut[i]
            } else break
          }

          return {x, y: 0, w, h: +height}
        })
      }
    })
  })
  count = null

  /* На этом этапе ключи объекта будут в порядке возрастания height */

  //находим раскрой из остатков
  let cutOfRemain = Object.keys(data.result)
    .filter(e => +e.split('_')[2] !== length)
    .sort((a, b) => b.split('_')[2] - a.split('_')[2])

  /* cutOfRemain массив отсортирован в порядке убывания использованноый длины для раскроя
  и каждая отдельная отсортирована в порядке убывания height */

  //добавляем раскрой из остатков в основной
  cutOfRemain.forEach(e => {
    const splitE = e.split('_'),
      rows = Object.keys(data.result).filter(e => e.split('_')[1] === splitE[2]), //в порядке убывания height
      splitName = rows[0].split('_'),
      addItems = data.result[e].map(e => ({x: e.x + (splitName[2] - splitName[1]), y: 0, w: e.w, h: e.h}))

    data.result[rows[0]].push(...addItems)
    data.result[`${splitName[0]}_${splitE[1]}_${splitName[2]}_${splitE[3]}+${splitName[3]}`] = data.result[rows[0]]

    delete data.result[rows[0]]
    delete data.result[e]
  })
  cutOfRemain = null
  /* ключ объекта состоит из высота_остаток_заготовка_из каких раскроев построен*/

  //расположить по листам
  let cutting = new LinearCutter({
    parts: Object.keys(data.result).map(e => ({length: +e.split('_')[0] + edge + hem, count: 1})),
    stocks: [{length: height, count: 0}],
    ...cutParam
  })
  cutting.init()
  cutting = cutting.getResult().list
  data.sortRemain = Object.keys(data.result)
    .sort((a, b) => {
      switch (sort) {
        default:
        case 'up':
          return a.split('_')[1] - b.split('_')[1]
        case 'down':
          return b.split('_')[1] - a.split('_')[1]
      }
    })

  cutting.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      const res = []
      item.cut.forEach(el => {
        const index = data.sortRemain.findIndex(e => +e.split('_')[0] === el - edge - hem)

        res.push(data.result[data.sortRemain[index]])
        data.sortRemain.splice(index, 1)
      })
      let y = 0
      for (let el = 1; el < res.length; el++) {
        y += Math.max(...res[el - 1].map(e => +e.h + edge + hem))

        res[el].map(e => e.y += y)
      }
      data.plates.push(res)
    }
  })
  cutting = null

  //поджимаем вверх
  data.plates.forEach(item => {
    for (let i = 1; i < item.length; i++) {
      item[i].forEach(e1 => {
        for (let e2 of item[i - 1]) {
          let h = e2.y + e2.h + edge + hem
          if (e1.y > h && (e1.x >= e2.x && e1.x < e2.x + e2.w)) {
            e1.y = h
            break
          }
        }
      })
    }
  })

  //преобразуем массив
  data.plates = data.plates.map(e => {
    let res = []
    e.forEach(item => res = [...res, ...item])
    return res
  })

  //поиск неиспользованного пространства
  const findUnusedRect = (plate) => {
    let arr = Array.from(Array(height), () => new Array(length).fill(0)),
    res = []

    const fillRect = (startX, endX, startY, endY, value) => {
      for (let x = startX; x < endX + startX; x++) {
        for (let y = startY; y < endY + startY; y++) {
          arr[y][x] = value
        }
      }
    }

    const findEndY = (startX, startY) => {
      let h = 0
      for (let y = startY; y < height; y++) {
        if (arr[y][startX] === 1) break
        h++
      }
      return h
    }
    const findEndX = (startX, startY) => {
      let w = 0
      for (let x = startX; x < length; x++) {
        if (arr[startY][x] === 1) break
        w++
      }
      return w
    }

    //заполянеям массив прямоугольниками
    plate.forEach(rect => fillRect(rect.x, rect.w, rect.y, rect.h + edge + hem, 1))

    //ищем не занятое пространство
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < length; x++) {
        if (arr[y][x] !== 1 && arr[y][x] !== 2) {
          const w = findEndX(x, y),
            h = findEndY(x, y)

          fillRect(x, w, y, h, 2)
          res.push({x, y, w, h})
        }
      }
    }
  return res
  }

  data.plates.forEach((plate, i) => {
    data.unusedRectangle[i] = findUnusedRect(plate);
  })

  // for (let plate = data.plates.length - 1; plate >= 0; plate--) {//листы с раскроем
  //  for (let rect = data.plates[plate].length - 1; rect >= 0; rect--) {//прямоугольники на листе
  //    found: for (let unusedPlate = 0; unusedPlate < Object.values(data.unusedRectangle).length; unusedPlate++) {//неиспользованное пространство по листам
  //       for (let unusedRect = 0; unusedRect < Object.values(data.unusedRectangle)[unusedPlate].length; unusedRect++) {//неиспользованные пространства
  //         const wR = data.plates[plate][rect].w,
  //           hR = data.plates[plate][rect].h,
  //           wP = data.unusedRectangle[unusedPlate][unusedRect].w,
  //           hP = data.unusedRectangle[unusedPlate][unusedRect].h,
  //           xP = data.unusedRectangle[unusedPlate][unusedRect].x,
  //           yP = data.unusedRectangle[unusedPlate][unusedRect].y
  //
  //         if (wR <= wP && hR + edge + hem <= hP) {
  //           data.plates[unusedPlate].push({x: xP, y: yP, w: wR, h: hR})
  //           data.plates[plate].splice(rect, 1)
  //           data.unusedRectangle[unusedPlate] = findUnusedRect(data.plates[unusedPlate])
  //           data.unusedRectangle[plate] = findUnusedRect(data.plates[plate])
  //           break found
  //         }
  //       }
  //     }
  //   }
  // }


  //todo преобразовать все числа в числа!

  data.plates.forEach(item => {
    const canvas = document.createElement('canvas')

    canvas.setAttribute('width', `${length}`)
    canvas.setAttribute('height', `${height}`)

    const ctx = canvas.getContext('2d')

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    item.forEach(e => {
      ctx.fillStyle = 'LightSeaGreen'
      ctx.fillRect(e.x, e.y, e.w, e.h)
      ctx.strokeRect(e.x, e.y, e.w, e.h)
      //кромка
      ctx.fillStyle = 'MediumAquamarine'
      ctx.fillRect(e.x, e.y + e.h, e.w, edge)
      ctx.strokeRect(e.x, e.y + e.h, e.w, edge)
      //подгиб
      ctx.fillStyle = 'DarkSeaGreen'
      ctx.fillRect(e.x, e.y + e.h + edge, e.w, hem)
      ctx.strokeRect(e.x, e.y + e.h + edge, e.w, hem)
    })

    document.querySelector('#graph').append(canvas)
  })
}

cutter({
  parts: [
    // {height: 60, length: 1311, count: 6},
    // {height: 70, length: 200, count: 6},
    // {height: 80, length: 300, count: 6},
    // {height: 90, length: 400, count: 6},
    // {height: 110, length: 500, count: 6},
    // {height: 120, length: 600, count: 6},
    // {height: 130, length: 700, count: 6},
    // {height: 100, length: 1311, count: 2},
    // {height: 150, length: 2011, count: 8},
    // {height: 120, length: 2011, count: 8},
    // {height: 150, length: 3144, count: 6},
    // {height: 200, length: 5000, count: 1},
     {height: 250, length: 830, count: 2},
     {height: 250, length: 3200, count: 1},
     {height: 250, length: 3600, count: 1},
     {height: 250, length: 6340, count: 1}
  ]
})