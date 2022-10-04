import {fnc} from './func'

export function calculate(p) {
  const {length, overLengthFirst, rotate, cut} = p.config

  let countIteration = 0

  fnc.bindContext(p)

  //создаем новый лист
  fnc.createNewPlate()

  while (p.parts.length || p.forDivide.length) {
    const currentPlate = p.plates[p._currentIndexPlate]
    let isFound = false

    //текущая используемая длина на листе
    const currLength = fnc.getCurrentLength(Math.max(...currentPlate.items.map(e => e.x + e.w), 0))

    //если превысили кратность то начинаем с самого маленького
    if (currLength === length) currentPlate.unusedSpace.reverse()

    //если сразу вычисляем изделия превышающие длину заготовки,
    //то перемещаем изделия не превышающие длину заготовки во временное хранилище
    //иначе ничинаем вычисление
    if (overLengthFirst && p.forDivide.length && !p.temporaryStorage) {
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
            const obj = {...curRect, x: currUnused.x, y: currUnused.y, w: curRect.w, h: curRect.h}

            if (rotate && isVertical && !obj.rotate) {
              [obj.w, obj.h] = [obj.h, obj.w]
              obj.rotate = true
            }

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
      fnc.allItemsDivide(overLengthFirst ? p.forDivide.length : 1, p._divideParam)

      fnc.sort(p.parts)
      fnc.resetCurrentPlate()
    }

    //если можно делить изделия и все уже было разложено
    if (cut && !p.parts.length && !p.forDivide.length) {
        const parts = fnc.selectItemsOfLastParts()
        if (parts.items) {
          const last = p.plates[p.plates.length - 1],
                l = length - (p.sizeStep * parts.emptyParts)
          p.forDivide = parts.items
          p._divideParam = {queue: true}
          if (!l) {
            fnc.deleteLastPlate()
          } else {
            last.length = l
            last.wasSelectedParts.length = Math.round(last.length / p.sizeStep) + 1
            fnc.findUnusedSpace(p.plates.length - 1)
          }

          fnc.resetCurrentPlate()
        }
    }

    if (++countIteration > p._maxIteration) {
      console.warn(`calculation aborted (iteration > ${p._maxIteration})`)
      break
    }
  }
}