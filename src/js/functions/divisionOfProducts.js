import {
  addItemToPlateAC, deleteLastPlateAC, dividerAC, fillRectAC, findUnusedSpaceAC, getConfigDataAC, getPlateItemsLengthAC,
  getPlateSizeAC, getPlatesLengthAC, selectItemsOfLastPartAC, setNewSizePlateAC
} from '../store/actionCreators'
import exceedingIterations from "./exceedingIterations"
import updateInfoParts from "./updateInfoParts"

function divisionOfProducts(sizeStep, maxIteration, height, unusedSpaceSymbol, showPartInName) {
  let dividedItems = null,
    countIteration = 0,
    lastPlateIndex = getPlatesLengthAC() - 1

  while (lastPlateIndex >= 0) {
    //если можно делить изделия и все уже было разложено
    const parts = selectItemsOfLastPartAC(lastPlateIndex)
    if (parts.length) {
      const uniqItems = parts.reduce((acc, el) => {
          acc[el.id] = acc[el.id] ? {parts: el.parts, items: acc[el.id]['items'] + 1} : {parts: el.parts, items: 1}
          return acc
        }, {}),
        comeBackItems = () => {
        const size = getPlateSizeAC(lastPlateIndex)
          const cb = () => {
            let x = size, y = 0, w = sizeStep, h = height
            if (!getConfigDataAC('axisX')) [x, y, w, h] = [y, x, h, w]
            fillRectAC({x, y, w, h, value: unusedSpaceSymbol, index: lastPlateIndex})
            parts.forEach(item => addItemToPlateAC(lastPlateIndex, item))
          }
          setNewSizePlateAC(lastPlateIndex, size + sizeStep, cb)
          lastPlateIndex--
        },
        putItems = () => {
          dividedItems.forEach(part => {
            addItemToPlateAC(part.fromPlate, part)
            findUnusedSpaceAC(part.fromPlate)
          })
        }

      dividedItems = dividerAC(parts.map(e => ({...e})))

      if (dividedItems === false) {
        comeBackItems()
      } else {
        dividedItems = updateInfoParts(uniqItems, dividedItems, showPartInName)
        putItems()
      }
      countIteration = 0

      if (!getPlateItemsLengthAC(lastPlateIndex < 0 ? 0 : lastPlateIndex)) {
        deleteLastPlateAC()
        lastPlateIndex--
      }
    }

    ++countIteration
    if (exceedingIterations(countIteration, maxIteration)) break
  }
}

export default divisionOfProducts