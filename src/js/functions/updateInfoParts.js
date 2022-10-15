import {updatePartNameAC, updatePartsInfoInPlateAC} from "../store/actionCreators"

function updateInfoParts(uniqItems, dividedItems) {
  Object.keys(uniqItems).forEach(itemId => {
    const partsFilter = dividedItems.filter(part => part.id === itemId),
      parts = uniqItems[itemId] + partsFilter.length - 1
    let count = 0
    partsFilter.forEach(part => {
      part.part = ++count
      part.parts = parts
      part.name = updatePartNameAC(part)
    })
    updatePartsInfoInPlateAC(itemId, count, parts)
  })
  return dividedItems
}

export default updateInfoParts