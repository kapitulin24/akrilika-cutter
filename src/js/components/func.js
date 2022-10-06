import {divider} from './divider'

export const fnc = {
  //прикрутить контекст
  bindContext(context) {
    this.c = context
  },

  //сброс текущего листа
  resetCurrentPlate() {
    this.c._currentIndexPlate = 0
  },

  //заполнить массив частей если их уже разделяли
  fillWasSelected(value = false, index = this.c.plates.length - 1) {
    const plate = this.c.plates[index],
      count = Math.round(plate.length / this.c.sizeStep)
    plate.wasSelectedParts = new Array(count).fill(value)
  },

  //можно ли разделять изделие
  canBeDivided(item) {
    return item.parts < this.c.config.maxStack + 1
  },

  //обновить имя изделия
  updatePartName(partItemOrName, part = false) {
    if (typeof partItemOrName === 'string' && part === false) {
      console.warn('props error')
      return
    }

    const name = typeof partItemOrName === 'string' ? partItemOrName : partItemOrName.name,
      regExp = new RegExp(`${this.c.config.partName}.+$`),
      partName = `${this.c.config.partName} ${part === false ? partItemOrName.part : part}`

    return regExp.test(name) ? name.replace(regExp, partName) : `${name} ${partName}`
  },

  //обновить информацию о частях изделий на листах
  updatePartsInfoInPlate(id, startPart, parts) {
    let count = startPart
    cancel: for (let i in this.c.plates) {
      for (let j in this.c.plates[i].items) {
        const item = this.c.plates[i].items[j]
        if (item.id === id) {
          ++count
          item.name = this.updatePartName(item, count)
          item.part = count
          item.parts = parts
          if (count === parts) break cancel
        }
      }
    }
  },

  //создать новый лист
  createNewPlate() {
    const c = this.c
    let lastPlate = c.plates.length - 1, isCreated, newLength
    const length = c.config.length, height = c.config.height,
      lastLength = c.plates[lastPlate]?.length || length

    //если длина последнего листа равна общей длине листа, то создаем новый лист
    if (lastLength === length) {
      const matrix = Array.from(Array(height), () => new Array(length).fill(this.c._symbols.unusedSpace)),
        newPlate = {
          length, height, items: [], matrix,
          unusedSpace: [{x: 0, y: 0, w: length, h: height}],
          spaceSymbol: c._symbols.startSpace
        }

      c.plates.push(newPlate)
      this.fillWasSelected()
      isCreated = true
    } else { //иначе добавляем к длине листа кратными частями
      newLength = this.getCurrentLength(lastLength, 'ceil')

      if (newLength === lastLength && newLength < length) {
        newLength = this.getCurrentLength(lastLength + 1, 'ceil')
      }

      c.plates[lastPlate].length = newLength
      this.findUnusedSpace(lastPlate)
      isCreated = false
    }

    return isCreated
  },

  getCurrentLength(length, mode = 'floor') {
    const modes = ['round', 'ceil', 'floor']
    if (!modes.find(e => e === mode)) throw new Error('mode is error')

    return Math[mode](length / this.c.sizeStep) * this.c.sizeStep
  },

  //удалить последний лист
  deleteLastPlate() {
    this.c.plates.splice(-1)
  },

  //сравнить массивы
  compareArr(arr1, arr2) {
    if (arr1.length !== arr2.length) return false

    for (let i in arr1) {
      if (arr1[i] !== arr2[i]) return false
    }
    return true
  },

  //разделить элементы
  allItemsDivide(iteration) {
    for (let item = 0; item < iteration; item++) {
      divider(this.c)
    }
  },

  //добавить прямоугольник в матрицу
  fillRect(x, w, y, h, param = {}) {
    const c = this.c,
      {
        index: index = c._currentIndexPlate,
        value: value = 1,
        space: space = false,
        rotate: rotate = false
      } = param
    let addW = 0, addH = space ? 0 : c.eh

    if (rotate) [addW, addH, w, h] = [addH, addW, h, w]

    for (let x1 = x; x1 < w + x + addW; x1++) {
      for (let y1 = y; y1 < h + y + addH; y1++) {
        c.plates[index].matrix[y1][x1] = value
      }
    }
  },

  //выделить из последнего листа элменты из его части
  selectItemsOfLastParts(plate = this.c.plates.length - 1) {
    let res = [], emptyParts = 0
    const current = this.c.plates[plate]

    cancel: for (let step = this.c.config.length - this.c.sizeStep, num = this.c.countPart - 1; step >= 0; step -= this.c.sizeStep, num--) {
      for (let item = 0; item < current.items.length; item++) {
        const el = current.items[item],
          w = el.rotate ? el.h + this.c.eh : el.w
        if (el.x + w > step) {
          if (current.wasSelectedParts.length - 1 >= num && current.wasSelectedParts[num]) {
            break cancel
          }
          const fillParam = {
            rotate: el.rotate,
            value: 0,
            index: plate
          }
          res.push({...el})
          this.fillRect(el.x, el.w, el.y, el.h, fillParam)
          current.items.splice(item, 1)
          item--
        }
      }
      if (res.length) {
        current.wasSelectedParts[num] = true
        break
      } else emptyParts++
    }

    return {items: res.length ? res : false, emptyParts: ++emptyParts}
  },

//поиск неиспользованного пространства
  findUnusedSpace(index = this.c._currentIndexPlate, divideMode = false) {
    const c = this.c,
      s = c._symbols
    let length = c.plates[index].length, res = [],
      arr = c.plates[index].matrix,
      spaceSymbol = c.plates[index].spaceSymbol === s.startSpace ? s.alternateSpace : s.startSpace,
      divideSymbol = divideMode ? s.divide : s.rect

    c.plates[index].spaceSymbol = spaceSymbol

    const conditionFind = (x, y) => arr[x][y] === s.rect || arr[x][y] === divideSymbol
    const findEndY = (startX, startY) => {
      let h = 0, topY = 0
      for (let y = startY; y < c.config.height; y++) {
        if (conditionFind(y, startX)) break
        h++
      }
      for (let y = startY - 1; y >= 0; y--) {
        if (conditionFind(y, startX)) break
        topY++
        h++
      }
      return {h, y: topY}
    }
    const findEndX = (startX, startY, topY) => {
      let w = 0, leftX = 0
      for (let x = startX; x < length; x++) {
        if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
        w++
      }
      // for (let x = startX - 1; x >= 0; x--) {
      //   if (conditionFind(startY, x) || conditionFind(startY - topY, x)) break
      //   leftX++
      //   w++
      // }
      return {w, x: leftX}
    }

    //ищем не занятое пространство
    for (let y = 0; y < c.config.height; y++) {
      for (let x = 0; x < length; x++) {
        if (arr[y][x] !== s.rect && arr[y][x] !== spaceSymbol && arr[y][x] !== divideSymbol) {
          const {h, y: topY} = findEndY(x, y),
            {w, x: leftX} = findEndX(x, y, topY),
            fillParam = {
              index,
              value: spaceSymbol,
              space: true
            }

          this.fillRect(x - leftX, w, y - topY, h, fillParam)
          res.push({x: x - leftX, y: y - topY, w, h, fromPlate: index})
        }
      }
    }

    return divideMode ? res : c.plates[index].unusedSpace = this.sort(res)
  },

  //сортировка по убыванию
  sort(arr, param = 'w') {
    return arr.sort((a, b) => b[param] - a[param])
  },

  //случайный id
  rndID(length = 8) {
    return Math.random().toString(36).substr(2, length)
  }
}