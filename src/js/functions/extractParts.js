import rndID from "./rndID"
import decreaseSort from "./decreaseSort"

function extractParts(parts, name, length, partName, nameIsPrefix, minPart) {
  const result = []

  //раскукоживаем
  parts.forEach((rect, i) => {
    for (let part = 1; part <= rect.count; part++) {
      const baseName = rect.name
          ? `${nameIsPrefix ? name : ''}${rect.name} ${part}`
          : `${name} ${i + 1}-${part}`,
        id = rndID(),
        parts = Math.ceil(rect.length / (length)),
        h = rect.height,
        w = rect.length % length || length,
        difference = w > 0 && w < minPart ? minPart - w : 0

      for (let i = 0, part = 1; i < rect.length; i += length, part++) {
        const name = baseName + (parts > 1 ? ` ${partName} ${part}` : ''),
              width = part === 1 ? w + difference : part === 2 ? length - difference : length
        result.push({...rect, name, w: width, h, id, part, parts})
      }
    }
  })

  //сортировка раскукоженного по убыванию ширины
  return decreaseSort(result)
}

export default extractParts