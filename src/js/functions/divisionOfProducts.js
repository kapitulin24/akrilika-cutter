import {
  addItemToPlateAC, deleteLastPlateAC, dividerAC, fillRectAC, findUnusedSpaceAC, getPlateItemsLengthAC,
  getPlateLengthAC, getPlatesLengthAC, selectItemsOfLastPartAC, setNewLengthPlateAC
} from "../store/actionCreators"
import exceedingIterations from "./exceedingIterations"
import updateInfoParts from "./updateInfoParts"

function divisionOfProducts(length, sizeStep, maxIteration, height, unusedSpaceSymbol) {
  let dividedItems = null,
    countIteration = 0,
    lastPlateIndex = getPlatesLengthAC() - 1

  while (lastPlateIndex >= 0) {
    //если можно делить изделия и все уже было разложено
    const parts = selectItemsOfLastPartAC(lastPlateIndex)
    if (parts.length) {
      const uniqItems = parts.reduce((acc, el) => {
          acc[el.id] = el.parts
          return acc
        }, {}),
        comeBackItems = () => {
        const x = getPlateLengthAC(lastPlateIndex)
          setNewLengthPlateAC(lastPlateIndex, x + sizeStep)
          fillRectAC({x, y: 0, w: sizeStep, h: height, value: unusedSpaceSymbol, index: lastPlateIndex, space: true})
          parts.forEach(item => addItemToPlateAC(lastPlateIndex, item))
          findUnusedSpaceAC(lastPlateIndex) //items всегда с одного листа
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
        dividedItems = updateInfoParts(uniqItems, dividedItems)
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