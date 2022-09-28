import {fnc} from './func'

const divider = (p, param = {}) => {
  const {length, step, minPart, edge, hem, maxStack, partName, rotate} = p.config
  let {lastPlateLength: lastPlateLength = length} = param, ms = maxStack

  //рекурсивный поиск оптимальных частей на которые можно разделить изделие
  const findParts = (startSumm = 0) => {
    let summ = startSumm,
      res = new Array(Math.trunc(startSumm / length)).fill(length)

    startSumm % length && res.push(startSumm % length)

    if (res.length < ms + 1) {
      for (let i = 0; i < p.unusedRect.length - 1; i++) {

        //если следующий элемент ближе к нужному размеру переходим к нему
        if (summ + p.unusedRect[i + 1].w > currRect.w) {
          continue
        } else {
          summ += p.unusedRect[i].w
          res.push(p.unusedRect[i].w)
        }

        //прерываем если нашли сумму или превысили максимально количество стыков
        if (summ >= currRect.w || res.length === ms + 1) break
      }
    }

    //если не нашли нужную сумму запускам функцию с новыми параметрами
    if (summ < currRect.w)
      return findParts(startSumm + (length * step))
    else {
      //находим истинный размер
      res[res.length - 1] -= summ - currRect.w

      //проверка на условие минимального отрезка
      //в случае когда в массиве 1 элемент условие не выполнится, валидация не пропустит
      if (res[res.length - 1] < minPart) {
        res[res.length - 2] -= minPart - res[res.length - 1]
        res[res.length - 1] = minPart
      }
      return res
    }
  }

  //первый элемент тот что больше заготовки, он всегда самый длинный
  const currRect = p.forDivide[0]

  ms = maxStack + 1 - currRect.parts

  //повернутый элемент поворачиваем обратно
  if (currRect && currRect.rotate) {
    currRect.rotate = false;
    [currRect.w, currRect.h] = [currRect.h, currRect.w]
  }

  //валидация сразу предусматривает что тут не будут заготовки которые невозможно разделить
  //на нужное количество стыков, поэтому можно сразу удалить
  p.forDivide.splice(0, 1)

  //ищем свободные простанства
  p.unusedRect = []
  p.plates.forEach((plate, i) => {
    let l = length
    if (i === p.plates.length - 1) l = lastPlateLength

    for (let i of fnc.findUnusedRect(plate, l)) {
      if (i.h >= currRect.h + edge + hem && i.w >= minPart) {
        p.unusedRect.push(i)
      } else if (rotate && i.w >= currRect.h + edge + hem && i.h >= minPart) {
        [i.w, i.h] = [i.h, i.w];
        p.unusedRect.push({...i, rotate: true})
      }
    }
  })

  //todo посчитать сколько можно раз делить и исправить и таких же part и parts

  //сортируем по убыванию длины
  fnc.sort(p.unusedRect)
  //фейковый последний элемент
  p.unusedRect.push({w: 0})

  const parts = findParts()

  p.parts.push(...parts.map((e, i) => {
    return {
      ...currRect,
      name: `${currRect.name} ${partName} ${i + 1}`,
      w: e,
      h: currRect.h,
      part: i + 1,
      parts: parts.length
    }
  }))
}

export {divider}