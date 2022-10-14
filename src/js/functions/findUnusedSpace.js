//поиск неиспользованного пространства
import {fillRectAC, getCurrentIndexPlateAC, setNewUnusedSpaceAC} from "../store/actionCreators"
import decreaseSort from "./decreaseSort"

function findUnusedSpace(plates, height, symbols, index = getCurrentIndexPlateAC(), divideMode = false) {
  let length = plates[index].length, res = [],
    arr = plates[index].matrix,
    spaceSymbol = plates[index].spaceSymbol === symbols.startSpace ? symbols.alternateSpace : symbols.startSpace,
    divideSymbol = divideMode ? symbols.divide : symbols.rect

  plates[index].spaceSymbol = spaceSymbol

  const conditionFind = (x, y) => arr[x][y] === symbols.rect || arr[x][y] === divideSymbol
  const findEndY = (startX, startY) => {
    let h = 0, topY = 0
    for (let y = startY; y < height; y++) {
      if (conditionFind(y, startX)) break
      h++
    }
    for (let y = startY - 1; y >= 0; y--) {
      if (conditionFind(y, startX)) break
      topY++
      h++
    }
    return {h, y: topY}
  }
  const findEndX = (startX, startY, topY) => {
    let w = 0, leftX = 0
    for (let x = startX; x < length; x++) {
      if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
      w++
    }
    // for (let x = startX - 1; x >= 0; x--) {
    //   if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
    //   leftX++
    //   w++
    // }
    return {w, x: leftX}
  }

  //ищем не занятое пространство
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < length; x++) {
      if (arr[y][x] !== symbols.rect && arr[y][x] !== spaceSymbol && arr[y][x] !== divideSymbol) {
        const {h, y: topY} = findEndY(x, y),
          {w, x: leftX} = findEndX(x, y, topY)

        fillRectAC({x: x - leftX, w, y: y - topY, h, index, value: spaceSymbol, space: true})
        res.push({x: x - leftX, y: y - topY, w, h, fromPlate: index})
      }
    }
  }

  return divideMode ? res : setNewUnusedSpaceAC(index, decreaseSort(res))
}

export default findUnusedSpace