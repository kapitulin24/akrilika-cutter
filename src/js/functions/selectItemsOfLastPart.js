//выделить из последнего листа элменты из его части
import {
  deletePlateItemAC, fillRectAC, findUnusedSpaceAC, getPlateItemAC, getPlateItemsLengthAC, setNewLengthPlateAC,
} from "../store/actionCreators"

function selectItemsOfLastPart(length, sizeStep, countPart, index, eh) {
  let emptyParts = 0
  const res = []

  for (let step = length - sizeStep, num = countPart - 1; step >= 0; step -= sizeStep, num--) {
    for (let item = 0; item < getPlateItemsLengthAC(index); item++) {
      const el = getPlateItemAC(index, item),
        w = el.rotate ? el.h + eh : el.w
      if (el.x + w > step) {
        res.push({...el})
        fillRectAC({x: el.x, w: el.w, y: el.y, h: el.h, rotate: el.rotate, value: 0, index})
        deletePlateItemAC(index, item)
        item--
      }
    }
    if (res.length) break
    else emptyParts++
  }

  setNewLengthPlateAC(index, length - (sizeStep * ++emptyParts))
  findUnusedSpaceAC(index)

  return res.length ? res : false
}

export default selectItemsOfLastPart