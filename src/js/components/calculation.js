import {fnc} from './func'

const calcOverlength = (p) => {
  const {length, step, minPart, edge, hem, maxStack, partName} = p.config

  //первый элемент тот что больше заготовки, он всегда самый длинный
  const currRect = p.overlengths[0]

  //валидация сразу предусматривает что тут не будут заготовки которые невозможно разделить
  //на нужное количество стыков, поэтому можно сразу удалить
  p.overlengths.splice(0, 1)

  //ищем свободные простанства
  p.unusedRect = []
  p.plates.forEach(plate => {
    p.unusedRect.push(...fnc.findUnusedRect(plate)
      .filter(rect => rect.h >= currRect.h + edge + hem && rect.w >= minPart))
  })

  //сортируем по убыванию длины
  fnc.sort(p.unusedRect)

  //рекурсивный поиск оптимальных частей на которые можно разделить изделие
  const findParts = (startSumm = 0) => {
    let summ = startSumm,
      res = new Array(Math.trunc(startSumm / length)).fill(length)

    startSumm % length && res.push(startSumm % length)

    if (res.length < maxStack + 1) {
      for (let i = 0; i < p.unusedRect.length - 1; i++) {

        //если следующий элемент ближе с нужному размеру переходим к нему
        if (summ + p.unusedRect[i + 1].w > currRect.w) {
          continue
        } else {
          summ += p.unusedRect[i].w
          res.push(p.unusedRect[i].w)
        }

        //прерываем если нашли сумму или превысили максимально количество стыков
        if (summ >= currRect.w || res.length === maxStack + 1) break
      }
    }

    //если не нашли нужную сумму запускам функцию с новыми параметрами
    if (summ < currRect.w)
      return findParts(startSumm + (length * step))
    else {
      //находим истинный размер
      res[res.length - 1] -= summ - currRect.w

      //проверка на условие минимального отрезка
      //в случае когда в массиве 1 элемент условие не выполнится, валидация не пропустит
      if (res[res.length - 1] < minPart) {
        res[res.length - 2] -= minPart - res[res.length - 1]
        res[res.length - 1] = minPart
      }
      return res
    }
  }

  p.parts.push(...findParts().map((e, i) => {
    return {
      name: `${currRect.name} ${partName} ${i + 1}`,
      w: e,
      h: currRect.h
    }
  }))
}

export function calculate(p) {
  let countIteration = 0, currentPlate = 0
  const {length, step, overLengthFirst, edge, hem, rotate} = p.config,
    sizeStep = length * step //кратность листа в линейном выражении

  fnc.bindContext(p)

  while (p.parts.length || p.overlengths.length) {
    //найти неиспользуемые пространства
    p.unusedRect = fnc.findUnusedRect(p.plates[currentPlate])

    //сортировка от максимальной до минимальной ширины
    fnc.sort(p.unusedRect)

    //текущая используемая длина на листе
    const currLength = Math.floor(p.unusedRect[p.unusedRect.length - 1].w / sizeStep) * sizeStep

    //если превысили кратность то начинаем с самого маленького
    if (currLength === length) p.unusedRect.reverse()

    //если сразу вычисляем изделия превышающие длину заготовки,
    //то перемещаем изделия не превышающие длину заготовки во временное хранилище
    //иначе ничинаем вычисление
    if (overLengthFirst && p.overlengths.length && !p.temporaryStorage) {
      p.temporaryStorage = p.parts
      p.parts = []
    } else {
      found: for (let unused = 0; unused < p.unusedRect.length; unused++) {
        const currUnused = p.unusedRect[unused]
        for (let rect = 0; rect < p.parts.length; rect++) {
          const curRect = p.parts[rect],
                isHorizontal = curRect.w <= currUnused.w && curRect.h + edge + hem <= currUnused.h,
                isVertical = curRect.w <= currUnused.h && curRect.h + edge + hem <= currUnused.w

          if (isHorizontal || isVertical) { //если найдено
            const obj = {name: curRect.name, x: currUnused.x, y: currUnused.y, w: curRect.w, h: curRect.h}

            if (rotate && isVertical) {
              [obj.w, obj.h] = [obj.h, obj.w]
              obj.rotate = true
            }

            p.plates[currentPlate].push(obj)
            p.parts.splice(rect, 1)
            break found
          }
        }

        //если ничего не найдено, то создаем новый лист если находимся на последнем
        //и только если текущий лист уже был использован
        if (unused === p.unusedRect.length - 1 && p.plates[currentPlate].length) {
          currentPlate === p.plates.length - 1 && fnc.createNewPlate()
          currentPlate++
        }
      }

      //если во временном хранилище есть изделия, отсутсвуют изделия првышающие длину заготовки
      //и отсутсвуют изделия для раскладки то перемещаем туда изделия из врменного хранилища
      if (!p.overlengths.length && p.temporaryStorage && !p.parts.length) {
        p.parts = p.temporaryStorage
        p.temporaryStorage = null
      }
    }

    //если закончились остатки то беремся за те которые превысили длину листа
    /* находим только оптимальное деление только самого первого, удаляем из overlengths и выплёвывыем во внешний цикл */
    if (!p.parts.length && p.overlengths.length) {


      //если вычисляются заготовки больше размера листа первыми, то считаем сразу все
      //иначе по одной сратаемся разбросать по свободным местам
      const iteration = overLengthFirst ? p.overlengths.length : 1

      for (let item = 0; item < iteration; item++) {
        calcOverlength(p)
      }

      fnc.sort(p.parts)
      currentPlate = 0
    }

    if (++countIteration > p.maxIteration) {
      console.warn(`calculation aborted (iteration > ${p.maxIteration})`)
      break
    }
  }
}