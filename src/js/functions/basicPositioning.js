import {
  addItemsToPlateAC,
  createNewPlateAC,
  deletePartItemAC,
  fillRectAC,
  findUnusedSpaceAC,
  calcCurrentLengthAC,
  getCurrentIndexPlateAC,
  getMaxX1AC,
  getPartItemAC,
  getPartsLengthAC,
  getPlateItemsLengthAC,
  getPlatesLengthAC,
  getUnusedSpaceItemAC,
  getUnusedSpaceLengthAC,
  nextIndexPlateAC,
  reverseUnusedSpaceAC
} from "../store/actionCreators"
import exceedingIterations from "./exceedingIterations"

function basicPositioning(isRotate, maxIteration, eh) {
  let countIteration = 0
  while (getPartsLengthAC()) {
    let isFound = false
    const fromPlate = getCurrentIndexPlateAC()

    //текущая используемая длина на листе
    const currLength = calcCurrentLengthAC(getMaxX1AC())

    //если превысили кратность то начинаем с самого маленького
    if (currLength === length) reverseUnusedSpaceAC()

    found: for (let unused = 0; unused < getUnusedSpaceLengthAC(); unused++) {
      const currUnused = getUnusedSpaceItemAC(unused)
      for (let rect = 0; rect < getPartsLengthAC(); rect++) {
        const curRect = getPartItemAC(rect),
          isHorizontal = curRect.w <= currUnused.w && curRect.h + eh <= currUnused.h,
          isVertical = curRect.w <= currUnused.h && curRect.h + eh <= currUnused.w

        if (isHorizontal || (isRotate && isVertical)) { //если найдено
          const obj = {
            ...curRect,
            x: currUnused.x,
            y: currUnused.y,
            w: curRect.w,
            h: curRect.h,
            fromPlate
          }

          if (isRotate && isVertical && !obj.rotate) obj.rotate = true

          addItemsToPlateAC(fromPlate, obj)
          fillRectAC({x: obj.x, w: obj.w, y: obj.y, h: obj.h, rotate: obj.rotate})
          deletePartItemAC(rect)
          //обновляем неиспользуемые пространства
          findUnusedSpaceAC()
          isFound = true
          countIteration = 0
          break found
        }
      }

      //если ничего не найдено, то создаем новый лист если находимся на последнем
      //и только если текущий лист уже был использован
      if (unused === getUnusedSpaceLengthAC() - 1 && getPlateItemsLengthAC()) {
        let isCreated = true
        if (fromPlate === getPlatesLengthAC() - 1) {
          isCreated = createNewPlateAC()
        }
        isCreated && !isFound && nextIndexPlateAC()
      }
    }

    ++countIteration
    if (exceedingIterations(countIteration, maxIteration)) break
  }
}

export default basicPositioning