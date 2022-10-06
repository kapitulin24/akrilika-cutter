import {fnc} from './func'

export function prepareData(p) {
  fnc.bindContext(p)

  p.config.name = p.config.name.toString()
  p.config.partName = p.config.partName.toString()
  p.config.length = +p.config.length
  p.config.height = +p.config.height
  p.config.step = +p.config.step
  p.config.edge = +p.config.edge
  p.config.hem = +p.config.hem
  p.config.minPart = +p.config.minPart
  p.config.maxStack = +p.config.maxStack
  p.config.parts = p.config.parts.map(e => ({
    ...e,
    name: e.name,
    length: +e.length,
    height: +e.height,
    count: +e.count
  }))

  //раскукоживаем
  p.config.parts.forEach((rect, i) => {
    for (let part = 1; part <= rect.count; part++) {
      const baseName = rect.name
          ? `${p.config.nameIsPrefix ? p.config.name : ''}${rect.name} ${part}`
          : `${p.config.name} ${i + 1}-${part}`,
        id = fnc.rndID(),
        parts = Math.ceil(rect.length / (p.config.length)),
        w = rect.length % p.config.length,
        h = rect.height

      for (let i = 0, part = 1; i <= rect.length; i += p.config.length, part++) {
        const name = baseName + (parts > 1 ? ` ${p.config.partName} ${part}` : '')
        p.parts.push({...rect, name, w: part === 1 ? w : p.config.length, h, id, part, parts})
      }
    }
  })

  //сортировка раскукоженного по убыванию ширины
  fnc.sort(p.parts)
}