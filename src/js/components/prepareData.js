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
  p.config.parts = p.config.parts.map(e => ({name: e.name, length: +e.length, height: +e.height, count: +e.count}))

  //раскукоживаем
  p.config.parts.forEach((rect, i) => {
    for (let part = 1; part <= rect.count; part++) {
      const name = rect.name
        ? `${p.config.nameIsPrefix ? p.config.name : ''}${rect.name} ${part}`
        : `${p.config.name} ${i}-${part}`

      p.parts.push({name, w: rect.length, h: rect.height})
    }
  })

  //сортировка раскукоженного по убыванию ширины
  fnc.sort(p.parts)

  //отделяем отрезки больше длины заготовки
  for (let part = 0; part < p.parts.length; part++) {
    if (p.parts[part].w > p.config.length) {
      p.overlengths.push({name: p.parts[part].name, w: p.parts[part].w, h: p.parts[part].h})
      p.parts.splice(part, 1)
      part--
    }
  }
}