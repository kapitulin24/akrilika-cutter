import {fnc} from './func'

const divider = (p) => {
  const {length, step, minPart, edge, hem, maxStack, partName, rotate} = p.config
  let ms = maxStack, parts

  //рекурсивный поиск оптимальных частей на которые можно разделить изделие
  const findParts = (startSumm = 0) => {
    let summ = startSumm,
      res = new Array(Math.trunc(startSumm / length)).fill(length)

    startSumm % length && res.push(startSumm % length)

    if (res.length < ms) {
      for (let i = 0; i < p.unusedRectAll.length - 1; i++) {

        //если следующий элемент ближе к нужному размеру переходим к нему
        if (summ + p.unusedRectAll[i + 1].w > currRect.w) {
          continue
        } else {
          summ += p.unusedRectAll[i].w
          res.push(p.unusedRectAll[i].w)
        }

        //прерываем если нашли сумму или превысили максимально количество стыков
        if (summ >= currRect.w || res.length === ms) break
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

  /*валидация сразу предусматривает что тут не будут заготовки которые невозможно разделить
    на нужное количество стыков, поэтому можно сразу удалить*/
  p.forDivide.splice(0, 1)

  ms = maxStack + 2 - currRect.parts

  //повернутый элемент поворачиваем обратно
  if (currRect && currRect.rotate) {
    currRect.rotate = false;
    [currRect.w, currRect.h] = [currRect.h, currRect.w]
  }

  //ищем свободные простанства
  p.unusedRectAll = []
  p.unusedRect.forEach(plate => {
    plate.forEach(rect => {
      if (rect.h >= currRect.h + edge + hem && rect.w >= minPart) {
        p.unusedRectAll.push(rect)
      } else if (rotate && rect.w >= currRect.h + edge + hem && rect.h >= minPart) {
        [rect.w, rect.h] = [rect.h, rect.w];
        p.unusedRectAll.push({...rect, rotate: true})
      }
    })
  })

  //todo посчитать сколько можно раз делить и исправить и таких же part и parts
  //todo разобраться с расположением есть 1 ошибка
  //todo исправить пересечение прямоугольников(свободных)
  //todo все настройки листов в листы

  //сортируем по убыванию длины
  fnc.sort(p.unusedRectAll)
  //фейковый последний элемент
  p.unusedRectAll.push({w: 0})

  parts = findParts()
  p.unusedRectAll = null

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