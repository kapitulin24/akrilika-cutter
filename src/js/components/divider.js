import {fnc} from './func'

const divider = (p) => {
  const {minPart, maxStack, rotate} = p.config
  let maxPart, parts, part = 0

  //ищем свободные простанства
  const findUnusedAll = () => {
    p.unusedRectAll = []
    for (let plate = 0; plate < p.plates.length; plate++) {
      p.unusedRectAll.push(...fnc.findUnusedSpace(plate, true))
    }
  }

  const filterUnusedAll = () => {
    p.unusedRectAll = fnc.sort(p.unusedRectAll.filter(space => {
      if (space.h >= currRect.h + p.eh && space.w >= minPart) {
        return true
      } else if (rotate && !space.rotate && space.w >= currRect.h + p.eh && space.h >= minPart) {
        [space.w, space.h] = [space.h, space.w]
        space.rotate = true
        return true
      }
      return false
    }))
    //фейковый последний элемент
    p.unusedRectAll.push({w: 0})
  }

//рекурсивный поиск оптимальных частей на которые можно разделить изделие
  const findParts = () => {
    let summ = 0,
      res = []

    if (res.length < maxPart) {
      for (let i = 0; i < p.unusedRectAll.length - 1; i++) {
        //если следующий элемент ближе к нужному размеру переходим к нему
        if (summ + p.unusedRectAll[i + 1].w > currRect.w) {
          continue
        } else {
          const current = p.unusedRectAll[i],
            index = current.fromPlate,
            fillParam = {
              rotate: current.rotate,
              value: p._symbols.divide,
              index
            }

          summ += current.w

          let w = current.w - (summ > currRect.w ? summ - currRect.w : 0),
              h = currRect.h

          res.push({w, h, fromPlate: current.fromPlate})
          fnc.fillRect(current.x, w, current.y, h, fillParam)

          for (let i = 0; i < p.unusedRectAll.length; i++) {
            if (p.unusedRectAll[i].fromPlate === index) {
              p.unusedRectAll.splice(i, 1)
              i--
            }
          }
          p.unusedRectAll.push(...fnc.findUnusedSpace(index, true))
          filterUnusedAll()
          i = -1
        }

        //прерываем если нашли сумму или превысили максимально количество стыков
        if (summ >= currRect.w || res.length === maxPart) break
      }
    }

    //если не нашли нужную сумму возвращаем входной элемент
    if (summ < currRect.w) return [currRect]

    return res
  }

  //первый элемент тот что больше заготовки, он всегда самый длинный
  const currRect = p.forDivide[0]
  /*валидация сразу предусматривает что тут не будут заготовки которые невозможно разделить
    на нужное количество стыков, поэтому можно сразу удалить*/
  p.forDivide.splice(0, 1)

  if (fnc.canBeDivided(currRect)) { //если можно делить
    maxPart = maxStack + 2 - currRect.parts

    //повернутый элемент поворачиваем обратно
    if (currRect && currRect.rotate) currRect.rotate = false;

    findUnusedAll()
    filterUnusedAll()

    parts = findParts()
    p.unusedRectAll = null
  } else {
    parts = [{...currRect}]
    part = currRect.part
  }

  const currParts = currRect.parts + parts.length - 1

  p.parts.push(...parts.map((e, i) => {
    return {
      ...currRect,
      ...e,
      part: part || i + 1,
      parts: currParts
    }
  }))
  if (parts.length > 1 && parts.length !== currParts) {
    let count = 0
    p.forDivide.forEach(e => {
      if (e.id === currRect.id) {
        e.part = parts.length + ++count
        e.parts = currParts
      }
    })
    fnc.changePartsInfoInPlate(currRect.id, parts.length + count, currParts)
  }
}

export {divider}

//todo посчитать сколько можно раз делить и исправить и таких же part и parts
//todo оптимизировать поиск незянятого пространства + увеличить шаг