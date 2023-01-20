//выделить из последнего листа элменты из его части
import {
  deletePlateItemAC, fillRectAC, getPlateItemAC, getPlateItemsLengthAC, setNewSizePlateAC,
} from "../store/actionCreators"

function selectItemsOfLastPart(size, sizeStep, countPart, index, axisX) {
  let emptyParts = 0
  const res = []

  for (let step = size - sizeStep, num = countPart - 1; step >= 0; step -= sizeStep, num--) {
    for (let item = 0; item < getPlateItemsLengthAC(index); item++) {
      const el = getPlateItemAC(index, item),
        value = (el.rotate && axisX) || (!el.rotate && !axisX) ? el.h : el.w,
        coord = axisX ? el.x : el.y

      if (coord + value > step) {
        res.push({...el})
        fillRectAC({x: el.x, w: el.w, y: el.y, h: el.h, rotate: el.rotate, value: 0, index})
        deletePlateItemAC(index, item)
        item--
      }
    }
    if (res.length) break
    else emptyParts++
  }

  setNewSizePlateAC(index, size - (sizeStep * ++emptyParts))

  return res.length ? res : false
}

export default selectItemsOfLastPart