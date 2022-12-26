import {fillRectAC, findUnusedSpaceAC} from "../store/actionCreators"
import decreaseSort from "./decreaseSort"

function divider(plates, minPart, rotate, maxStack, divideSymbol, items, length, unusedSpaceSymbol) {
  const result = []
  let unusedRectAll = null

  for (const currRect of items) {
    let maxPart, parts = false

    //ищем свободные простанства
    const findUnusedAll = () => {
      unusedRectAll = []
      for (let plate = 0; plate < plates.length; plate++) {
        unusedRectAll.push(...findUnusedSpaceAC(plate, true))
      }
      filterUnused()
    }

    const filterUnused = () => {
      unusedRectAll = decreaseSort(unusedRectAll.filter(space => {
        if (space.h >= currRect.h + currRect.hem + currRect.edge && space.w >= minPart) {
          return true
        } else if (rotate && !space.rotate && space.w >= currRect.h + currRect.hem + currRect.edge && space.h >= minPart) {
          [space.w, space.h] = [space.h, space.w]
          space.rotate = true
          return true
        }
        return false
      }))
      //фейковый последний элемент
      unusedRectAll.push({w: 0})
    }

    const rectsToBack = (res) => {
      res.forEach(e => fillRectAC({
        x: e.x, w: e.w, y: e.y, h: e.h,
        hem: e.hem, edge: e.edge,
        rotate: e.rotate,
        value: unusedSpaceSymbol,
        index: e.fromPlate
      }))
    }

    //поиск оптимальных частей на которые можно разделить изделие
    const findParts = (limit = Math.round(length / 2)) => {
      let summ = 0, res = []

      findUnusedAll()

      if (res.length < maxPart) {
        for (let i = 0; i < unusedRectAll.length - 1; i++) {
          //если следующий элемент ближе к нужному размеру переходим к нему
          if (summ + unusedRectAll[i + 1].w > currRect.w) {
            continue
          } else {
            const current = unusedRectAll[i],
              index = current.fromPlate

            current.w = current.w > limit ? limit : current.w
            summ += current.w

            let w = current.w - (summ > currRect.w ? summ - currRect.w : 0),
              h = currRect.h

            if (w < minPart) { //если ширина меньше минимальной то из каждого предыдущего отрезка пытаемся взять по кусочку
              for (let i = res.length - 1; i >= 0; i--) {
                const newWidth = res[i].w - (minPart - w)
                if (newWidth >= minPart) {
                  res[i].w = newWidth
                  w = minPart
                  break
                } else {
                  w += res[i].w - minPart
                  res[i].w = minPart
                }
                if (i === 0) return false //если невозможно возвращаем false
              }
            }

            res.push({
              ...currRect,
              x: current.x,
              y: current.y,
              w,
              h,
              fromPlate: current.fromPlate,
              rotate: current.rotate
            })
            fillRectAC({
              x: current.x, w, y: current.y, h,
              rotate: current.rotate, value: divideSymbol, index,
              hem: currRect.hem, edge: currRect.edge
            })

            for (let i = 0; i < unusedRectAll.length; i++) {
              if (unusedRectAll[i].fromPlate === index) {
                unusedRectAll.splice(i, 1)
                i--
              }
            }
            unusedRectAll.push(...findUnusedSpaceAC(index, true))
            filterUnused()
            i = -1
          }

          //прерываем если нашли сумму или превысили максимально количество стыков
          if (summ >= currRect.w || res.length === maxPart) break
        }
      }

      if (summ < currRect.w && limit < length) {//если не нашли нужную сумму с лимитом, то пробуем без него
        rectsToBack(res)
        return findParts(length)
      } else if (summ < currRect.w) {//иначе если просто не нашли нужную сумму
        return false
      }

      return res
    }

    //если объекты уже нельзя будет разделить то возможно они будут перемещены
    maxPart = maxStack + 2 - currRect.parts

    //повернутый элемент поворачиваем обратно
    if (currRect && currRect.rotate) currRect.rotate = false

    parts = findParts()

    if (parts === false) {
      rectsToBack(result)
      return false
    }

    result.push(...parts)
  }
  return result
}

export {divider}