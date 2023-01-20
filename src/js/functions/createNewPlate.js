//создать новый лист
import {calcCurrentSizeAC, pushNewPlateAC, setNewSizePlateAC} from '../store/actionCreators'

function createNewPlate(plates, size, length, height, startSpaceSymbol, unusedSpaceSymbol) {
  let lastPlate = plates.length - 1, isCreated, newSize
  const lastSize = plates[lastPlate]?.size || size

  //если размер последнего листа равен общему размеру, то создаем новый лист
  if (lastSize === size) {
    const matrix = Array.from(Array(height), () => new Array(length).fill(unusedSpaceSymbol)),
      newPlate = {
        length, height, items: [], matrix, size,
        unusedSpace: [{x: 0, y: 0, w: length, h: height}],
        spaceSymbol: startSpaceSymbol
      }

    pushNewPlateAC(newPlate)
    isCreated = true
  } else { //иначе добавляем к размеру листа кратными частями
    newSize = calcCurrentSizeAC(lastSize,  'ceil')

    if (newSize === lastSize && newSize < size) {
      newSize = calcCurrentSizeAC(lastSize + 1, 'ceil')
    }

    setNewSizePlateAC(lastPlate, newSize)
    isCreated = false
  }

  return isCreated
}

export default createNewPlate