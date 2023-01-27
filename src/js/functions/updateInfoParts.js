import {updatePartNameAC, updatePartsInfoInPlateAC} from "../store/actionCreators"

function updateInfoParts(uniqItems, dividedItems, showPartInName) {
  Object.keys(uniqItems).forEach(itemId => {
    const partsFilter = dividedItems.filter(part => part.id === itemId),
          parts = uniqItems[itemId].parts - uniqItems[itemId].items  + partsFilter.length
    let count = 0
    console.log(uniqItems)
    partsFilter.forEach(part => {
      part.part = ++count
      part.parts = parts
      showPartInName && (part.name = updatePartNameAC(part))
    })
    updatePartsInfoInPlateAC(itemId, count, parts)
  })
  return dividedItems
}

export default updateInfoParts