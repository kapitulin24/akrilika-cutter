import {fillRectAC, findUnusedSpaceAC} from "../store/actionCreators"
import decreaseSort from "./decreaseSort"

function divider(plates, minPart, rotate, eh, maxStack, divideSymbol, items) {
  const result = []
  let unusedRectAll = null

  while (items.length) {
    let maxPart, parts = [false]

    //ищем свободные простанства
    const findUnusedAll = () => {
      unusedRectAll = []
      for (let plate = 0; plate < plates.length; plate++) {
        unusedRectAll.push(...findUnusedSpaceAC(plate, true))
      }
    }

    const filterUnusedAll = () => {
      unusedRectAll = decreaseSort(unusedRectAll.filter(space => {
        if (space.h >= currRect.h + eh && space.w >= minPart) {
          return true
        } else if (rotate && !space.rotate && space.w >= currRect.h + eh && space.h >= minPart) {
          [space.w, space.h] = [space.h, space.w]
          space.rotate = true
          return true
        }
        return false
      }))
      //фейковый последний элемент
      unusedRectAll.push({w: 0})
    }

//поиск оптимальных частей на которые можно разделить изделие
    const findParts = () => {
      let summ = 0, res = []

      if (res.length < maxPart) {
        for (let i = 0; i < unusedRectAll.length - 1; i++) {
          //если следующий элемент ближе к нужному размеру переходим к нему
          if (summ + unusedRectAll[i + 1].w > currRect.w) {
            continue
          } else {
            const current = unusedRectAll[i],
              index = current.fromPlate

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
                if (i === 0) return [false] //если невозможно возвращаем false
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
            fillRectAC({x: current.x, w, y: current.y, h, rotate: current.rotate, value: divideSymbol, index})

            for (let i = 0; i < unusedRectAll.length; i++) {
              if (unusedRectAll[i].fromPlate === index) {
                unusedRectAll.splice(i, 1)
                i--
              }
            }
            unusedRectAll.push(...findUnusedSpaceAC(index, true))
            filterUnusedAll()
            i = -1
          }

          //прерываем если нашли сумму или превысили максимально количество стыков
          if (summ >= currRect.w || res.length === maxPart) break
        }
      }

      //если не нашли нужную сумму возвращаем входной элемент
      if (summ < currRect.w) return [false]

      return res
    }

    //первый элемент тот что больше заготовки, он всегда самый длинный
    const currRect = items[0]
    /*валидация сразу предусматривает что тут не будут заготовки которые невозможно разделить
      на нужное количество стыков, поэтому можно сразу удалить*/
    items.splice(0, 1)

    //если объекты уже нельзя будет разделить то возможно они будут перемещены
    maxPart = maxStack + 2 - currRect.parts

    //повернутый элемент поворачиваем обратно
    if (currRect && currRect.rotate) currRect.rotate = false

    findUnusedAll()
    filterUnusedAll()

    parts = findParts()

    result.push(...parts)
  }
  return result
}

export {divider}