import {
  addItemsToPlateAC, deleteLastPlateAC, dividerAC, fillRectAC, findUnusedSpaceAC, getPlateLengthAC,
  getPlatesLengthAC,
  selectItemsOfLastPartAC,
  setNewLengthPlateAC, updateInfoPartsAC
} from "../store/actionCreators"
import exceedingIterations from "./exceedingIterations"

function divisionOfProducts(length, sizeStep, maxIteration) {
  let next = true, dividedItems = null, countIteration = 0
  while (next) {
    //если можно делить изделия и все уже было разложено
    const parts = selectItemsOfLastPartAC()
    next = !!parts.items
    if (next) {
      const lastPlateIndex = getPlatesLengthAC() - 1,
        uniqItems = parts.items.reduce((acc, el) => {
          acc[el.id] = el.parts
          return acc
        }, {}),
        comeBackItems = () => {
          addItemsToPlateAC(lastPlateIndex, parts.items)
          setNewLengthPlateAC(lastPlateIndex, getPlateLengthAC(lastPlateIndex) + sizeStep)
          next = false
        },
        putItems = () => {
          dividedItems.forEach(part => {
            addItemsToPlateAC(part.fromPlate, part)
            fillRectAC({x: part.x, w: part.w, y: part.y, h: part.h, rotate: part.rotate, index: part.fromPlate})
            findUnusedSpaceAC(part.fromPlate)
          })
        }

      setNewLengthPlateAC(lastPlateIndex, length - (sizeStep * parts.emptyParts))
      findUnusedSpaceAC(lastPlateIndex)

      dividedItems = dividerAC(parts.items.map(e => ({...e})))

      if (dividedItems.some(e => e === false)) {
        comeBackItems()
      } else {
        updateInfoPartsAC(uniqItems)
        putItems()
      }
      countIteration = 0

      getPlateLengthAC(lastPlateIndex) || deleteLastPlateAC()
    }

    ++countIteration
    if (exceedingIterations(countIteration, maxIteration)) break
  }
}

export default divisionOfProducts