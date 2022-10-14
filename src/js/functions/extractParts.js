import rndID from "./rndID"
import decreaseSort from "./decreaseSort"

function extractParts(parts, name, length, partName, nameIsPrefix) {
  const result = []

  //раскукоживаем
  parts.forEach((rect, i) => {
    for (let part = 1; part <= rect.count; part++) {
      const baseName = rect.name
          ? `${nameIsPrefix ? name : ''}${rect.name} ${part}`
          : `${name} ${i + 1}-${part}`,
        id = rndID(),
        parts = Math.ceil(rect.length / (length)),
        w = rect.length % length,
        h = rect.height

      for (let i = 0, part = 1; i <= rect.length; i += length, part++) {
        const name = baseName + (parts > 1 ? ` ${partName} ${part}` : '')
        result.push({...rect, name, w: part === 1 ? w : length, h, id, part, parts})
      }
    }
  })

  //сортировка раскукоженного по убыванию ширины
  return decreaseSort(result)
}

export default extractParts