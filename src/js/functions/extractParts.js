import rndID from "./rndID"
import decreaseSort from "./decreaseSort"

function extractParts(parts, name, length, partName, nameIsPrefix, minPart) {
  let result = [], tResult = []

  //раскукоживаем
  parts.forEach((rect, i) => {
    for (let part = 1; part <= rect.count; part++) {
      const baseName = rect.name
          ? `${nameIsPrefix ? name : ''}${rect.name}`
          : `${name} ${i + 1}-${part}`,
        id = rndID(),
        parts = Math.ceil(rect.length / (length)),
        h = rect.height,
        w = rect.length % length || length,
        hem = rect.hem,
        edge = rect.edge,
        difference = w > 0 && w < minPart ? minPart - w : 0

      for (let i = 0, part = 1; i < rect.length; i += length, part++) {
        const width = part === 1 ? w + difference : part === 2 ? length - difference : length
        tResult.push({...rect, name: baseName, w: width, h, id, part, parts, hem, edge, rotate: false})
      }
    }
  })

  //группировка одинаковых ширин
  tResult = tResult.reduce((acc, el) => {
    acc[el.w] = acc[el.w] ? [...acc[el.w], el] : [el]
    return acc
  }, {})

  //сортировка по убыванию высоты в каждой группе ширины
  Object.keys(tResult).forEach(item => tResult[item].length > 1 && decreaseSort(tResult[item], 'h'))

  //сортировка по убыванию ширины
  decreaseSort(Object.keys(tResult), false).forEach(e => result.push(...tResult[e]))

  return result
}

export default extractParts