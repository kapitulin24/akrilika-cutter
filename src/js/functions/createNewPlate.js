//создать новый лист
import {findUnusedSpaceAC, calcCurrentLengthAC, pushNewPlateAC, setNewLengthPlateAC} from "../store/actionCreators"

function createNewPlate(plates, length, height, startSpaceSymbol, unusedSpaceSymbol) {
  let lastPlate = plates.length - 1, isCreated, newLength
  const lastLength = plates[lastPlate]?.length || length

  //если длина последнего листа равна общей длине листа, то создаем новый лист
  if (lastLength === length) {
    const matrix = Array.from(Array(height), () => new Array(length).fill(unusedSpaceSymbol)),
      newPlate = {
        length, height, items: [], matrix,
        unusedSpace: [{x: 0, y: 0, w: length, h: height}],
        spaceSymbol: startSpaceSymbol
      }

    pushNewPlateAC(newPlate)
    isCreated = true
  } else { //иначе добавляем к длине листа кратными частями
    newLength = calcCurrentLengthAC(lastLength,  'ceil')

    if (newLength === lastLength && newLength < length) {
      newLength = calcCurrentLengthAC(lastLength + 1, 'ceil')
    }

    setNewLengthPlateAC(lastPlate, newLength)
    findUnusedSpaceAC(lastPlate)
    isCreated = false
  }

  return isCreated
}

export default createNewPlate