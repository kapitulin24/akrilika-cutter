//поиск неиспользованного пространства
import {fillRectAC, getCurrentIndexPlateAC, setNewUnusedSpaceAC} from "../store/actionCreators"
import decreaseSort from "./decreaseSort"

function findUnusedSpace(minPart, plates, axisX, symbols, index = getCurrentIndexPlateAC(), divideMode = false) {
  const currLength = axisX ? plates[index].size : plates[index].length, res = [],
        currHeight = axisX ? plates[index].height : plates[index].size,
        arr = plates[index].matrix,
        spaceSymbol = plates[index].spaceSymbol === symbols.startSpace ? symbols.alternateSpace : symbols.startSpace,
        divideSymbol = divideMode ? symbols.divide : symbols.rect,
        //идем с шагом minPart - 1. в разы больше производительность и мы не пропустим отрезки с этим шагом
        step = minPart - 1 > 0 ? minPart - 1 : 1

  plates[index].spaceSymbol = spaceSymbol

  const conditionFind = (x, y) => arr[x][y] === symbols.rect || arr[x][y] === divideSymbol
  const findIndex = (arr, x, y, step) => {
    let s = step
    while (s > 1) {
      s = Math.ceil(s / 2)
      if (arr[x] !== arr[x - 1]) return x
      else if (conditionFind(y, x)) x += s
      else x -= s
    }
    return x
  }
  const findEndY = (startX, startY) => {
    let h = 0, topY = 0
    for (let y = startY; y < currHeight; y++/* += step*/) {
      if (conditionFind(y, startX)) break
      h++
    }
    for (let y = startY - 1; y >= 0; y--/* -= step*/) {
      if (conditionFind(y, startX)) break
      topY++
      h++
    }
    return {h, y: topY}
  }
  //можно попробовать оптимизировать через findIndex
  const findEndX = (startX, startY, topY) => {
    let w = 0, leftX = 0
    for (let x = startX; x < currLength; x++) {
      if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
      w++
    }
    // после тестов будет понятно нужен ли этот кусочек. он меняет правила игры в поиске незанятого пространства
    // если нужно тогда можно и в основном цикле поиска по y добавить +step
    // for (let x = startX - 1; x >= 0; x--) {
    //   if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
    //   leftX++
    //   w++
    // }
    return {w, x: leftX}
  }

  //ищем не занятое пространство
  for (let y = 0; y < currHeight; y++) {
    for (let x = 0; x < currLength; x += step) {
      if (arr[y][x] !== symbols.rect && arr[y][x] !== spaceSymbol && arr[y][x] !== divideSymbol) {
        x = findIndex(arr[y], x, y, step)
        const {h, y: topY} = findEndY(x, y),
          {w, x: leftX} = findEndX(x, y, topY)
        fillRectAC({x: x - leftX, w, y: y - topY, h, index, value: spaceSymbol})
        res.push({x: x - leftX, y: y - topY, w, h, fromPlate: index})
      }
    }
  }

  return divideMode ? res : setNewUnusedSpaceAC(index, decreaseSort(res))
}

export default findUnusedSpace