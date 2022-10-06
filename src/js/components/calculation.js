import {fnc} from './func'

export function calculate(p) {
  const {length, rotate, cut} = p.config

  let countIteration = 0, next = false

  fnc.bindContext(p)

  //создаем новый лист
  fnc.createNewPlate()

  while (p.parts.length || p.forDivide.length || next) {
    const currentPlate = p.plates[p._currentIndexPlate]
    let isFound = false

    //текущая используемая длина на листе
    const currLength = fnc.getCurrentLength(Math.max(...currentPlate.items.map(e => e.x + e.w), 0))

    //если превысили кратность то начинаем с самого маленького
    if (currLength === length) currentPlate.unusedSpace.reverse()

    //если сразу вычисляем изделия превышающие длину заготовки,
    //то перемещаем изделия не превышающие длину заготовки во временное хранилище
    //иначе ничинаем вычисление
    if (p.forDivide.length && !p.temporaryStorage) {
      p.temporaryStorage = p.parts
      p.parts = []
    } else {
      found: for (let unused = 0; unused < currentPlate.unusedSpace.length; unused++) {
        const currUnused = currentPlate.unusedSpace[unused]
        for (let rect = 0; rect < p.parts.length; rect++) {
          const curRect = p.parts[rect],
                isHorizontal = curRect.w <= currUnused.w && curRect.h + p.eh <= currUnused.h,
                isVertical = curRect.w <= currUnused.h && curRect.h + p.eh <= currUnused.w

          if (isHorizontal || (rotate && isVertical)) { //если найдено
            const obj = {
              ...curRect,
              x: currUnused.x,
              y: currUnused.y,
              w: curRect.w,
              h: curRect.h,
              fromPlate: p._currentIndexPlate
            }

            if (rotate && isVertical && !obj.rotate) obj.rotate = true

            currentPlate.items.push(obj)
            currentPlate.isChanged = true //флаг "изменялся"
            fnc.fillRect(obj.x, obj.w, obj.y, obj.h, {rotate: obj.rotate})
            p.parts.splice(rect, 1)
            //обновляем неиспользуемые пространства
            fnc.findUnusedSpace()
            isFound = true
            countIteration = 0
            break found
          }
        }

        //если ничего не найдено, то создаем новый лист если находимся на последнем
        //и только если текущий лист уже был использован
        if (unused === currentPlate.unusedSpace.length - 1 && currentPlate.items.length) {
          let isCreated = true
          if (p._currentIndexPlate === p.plates.length - 1) {
            isCreated = fnc.createNewPlate()
          }
          isCreated && !isFound && p._currentIndexPlate++
        }
      }

      //если во временном хранилище есть изделия, отсутсвуют изделия првышающие длину заготовки
      //и отсутсвуют изделия для раскладки то перемещаем туда изделия из врменного хранилища
      if (!p.forDivide.length && p.temporaryStorage && !p.parts.length) {
        p.parts = p.temporaryStorage
        p.temporaryStorage = null
      }
    }

    //если закончились остатки то беремся за те которые превысили длину листа
    /* находим только оптимальное деление только самого первого, удаляем из forDivide и выплёвывыем во внешний цикл */
    if (!p.parts.length && p.forDivide.length) {


      //если вычисляются заготовки больше размера листа первыми, то считаем сразу все
      //иначе по одной сратаемся разбросать по свободным местам
      fnc.allItemsDivide(p.forDivide.length)

      fnc.sort(p.parts)
      fnc.resetCurrentPlate()
    }

    //если можно делить изделия и все уже было разложено
    if (cut && !p.parts.length && !p.forDivide.length) {
      const parts = fnc.selectItemsOfLastParts()
      next = !!parts.items
      if (next) {
        const last = p.plates[p.plates.length - 1],
              uniqItems = parts.items.reduce((acc, el) => {
                acc[el.id] = el.parts
                return acc
              }, {}),
              comeBackItems = () => {
                last.items.push(...parts.items)
                last.length += p.sizeStep
                next = false
              },
              updateInfoParts = () => {
                Object.keys(uniqItems).forEach(itemId => {
                  const partsFilter = p.parts.filter(part => part.id === itemId),
                    parts = uniqItems[itemId] + partsFilter.length - 1
                  let count = 0
                  partsFilter.forEach(part => {
                    part.part = ++count
                    part.parts = parts
                    part.name = fnc.updatePartName(part)
                  })
                  fnc.updatePartsInfoInPlate(itemId, count, parts)
                })
              },
              putItems = () => {
                p.parts.forEach(part => {
                  p.plates[part.fromPlate].items.push(part)
                  fnc.fillRect(part.x, part.w, part.y, part.h, {rotate: part.rotate, index: part.fromPlate})
                  fnc.findUnusedSpace(part.fromPlate)
                })
              }

        p.forDivide = parts.items.map(e => ({...e})) //копируем каждый объект

        last.length = length - (p.sizeStep * parts.emptyParts)
        last.wasSelectedParts.length = Math.round(last.length / p.sizeStep) + 1
        fnc.findUnusedSpace(p.plates.length - 1)

        fnc.allItemsDivide(p.forDivide.length)

        if (p.parts.some(e => e === false)) {
          comeBackItems()
        } else {
          updateInfoParts()
          putItems()
        }

        p.parts = []
        last.length || fnc.deleteLastPlate()
        fnc.resetCurrentPlate()
      }
    }

    if (++countIteration > p._maxIteration) {
      console.warn(`calculation aborted (iteration > ${p._maxIteration})`)
      break
    }
  }
}