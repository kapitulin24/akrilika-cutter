import {fnc} from './func'

export function calculate(p) {
  const {length, overLengthFirst, edge, hem, rotate, cut} = p.config

  let countIteration = 0, currentPlate = 0

  fnc.bindContext(p)

  //создаем новый лист
  fnc.createNewPlate()

  while (p.parts.length || p.forDivide.length) {
    //на всех листах флаг "не изменялся"
    p.isChanged = p.isChanged.map(() => false)

    //текущая используемая длина на листе
    const currLength = fnc.getCurrentLength(p.unusedRect[currentPlate][p.unusedRect[currentPlate].length - 1].w)

    //если превысили кратность то начинаем с самого маленького
    if (currLength === length) p.unusedRect[currentPlate].reverse()

    //если сразу вычисляем изделия превышающие длину заготовки,
    //то перемещаем изделия не превышающие длину заготовки во временное хранилище
    //иначе ничинаем вычисление
    if (overLengthFirst && p.forDivide.length && !p.temporaryStorage) {
      p.temporaryStorage = p.parts
      p.parts = []
    } else {
      found: for (let unused = 0; unused < p.unusedRect[currentPlate].length; unused++) {
        const currUnused = p.unusedRect[currentPlate][unused]
        for (let rect = 0; rect < p.parts.length; rect++) {
          const curRect = p.parts[rect],
                isHorizontal = curRect.w <= currUnused.w && curRect.h + edge + hem <= currUnused.h,
                isVertical = curRect.w <= currUnused.h && curRect.h + edge + hem <= currUnused.w

          if (isHorizontal || (rotate && isVertical)) { //если найдено
            const obj = {...curRect, x: currUnused.x, y: currUnused.y, w: curRect.w, h: curRect.h}

            if (rotate && isVertical && !obj.rotate) {
              [obj.w, obj.h] = [obj.h, obj.w]
              obj.rotate = true
            }

            p.plates[currentPlate].push(obj)
            p.isChanged[currentPlate] = true
            p.parts.splice(rect, 1)
            //обновляем неиспользуемые пространства
            fnc.findUnusedRect(currentPlate)
            //сортировка от максимальной до минимальной ширины
            fnc.sort(p.unusedRect[currentPlate])
            break found
          }
        }

        //если ничего не найдено, то создаем новый лист если находимся на последнем
        //и только если текущий лист уже был использован
        if (unused === p.unusedRect[currentPlate].length - 1 && p.plates[currentPlate].length) {
          let isCreated = true
          if (currentPlate === p.plates.length - 1) {
            isCreated = fnc.createNewPlate()
          }
          isCreated  && currentPlate++
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
      fnc.allItemsDivide(overLengthFirst ? p.forDivide.length : 1, p.divideParam)

      fnc.sort(p.parts)
      currentPlate = 0
    }

    //если можно делить изделия и все уже было разложено
    if (cut && !p.parts.length && !p.forDivide.length) {
      // первый вход или предыдущее разделенное было разложено по листам кроме последнего
      if (!fnc.compareArr(p.isChangedDivide, p.isChanged, true)) {
        p.isChangedDivide = [...p.isChanged]
        const parts = fnc.selectItemsOfLastParts()
        if (parts.items) {
          p.forDivide = parts.items
          p.divideParam = {queue: true}
          p.platesLength[p.platesLength.length - 1] = length - (p.sizeStep * parts.emptyParts)
          fnc.findUnusedRect(currentPlate)
          //сортировка от максимальной до минимальной ширины
          fnc.sort(p.unusedRect[currentPlate])
          currentPlate = 0
        }

        //удаляем лист если освободили его полностью
        p.plates[p.plates.length - 1].length || fnc.deleteLastPlate(true)
      }
    }

    if (++countIteration > p.maxIteration) {
      console.warn(`calculation aborted (iteration > ${p.maxIteration})`)
      break
    }
  }
}