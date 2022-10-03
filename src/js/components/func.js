import {divider} from './divider'

export const fnc = {
  bindContext(context) {
    this.c = context
  },

  resetCurrentPlate() {
    this.c._currentIndexPlate = 0
  },

  //создать новый лист
  createNewPlate() {
    const c = this.c
    let lastPlate = c.plates.length - 1, isCreated, newLength
    const length = c.config.length, height = c.config.height,
          lastLength =c.plates[lastPlate]?.length || length

    //если длина последнего листа равна общей длине листа, то создаем новый лист
    if (lastLength === length) {
      const matrix = Array.from(Array(height), () => new Array(length).fill(0)),
            newPlate = {length, height, items: [], matrix,
              unusedSpace: [{x: 0, y:0, w: length, h: height}],
              spaceSymbol: c._startSpaceSymbol, isChanged: false
            }
      c.plates.push(newPlate)
      isCreated = true
    } else { //иначе добавляем к длине листа кратными частями
      newLength = this.getCurrentLength(lastLength, 'ceil')

      if (newLength === lastLength && newLength < length) {
        newLength = this.getCurrentLength(lastLength + 1, 'ceil')
      }

      const unusedSpace = this.findUnusedSpace(lastPlate)

      c.plates[lastPlate] = {...c.plates[lastPlate], length: newLength, unusedSpace}
      isCreated = false
    }

    return isCreated
  },

  getCurrentLength(length, mode = 'floor') {
    const modes = ['round', 'ceil', 'floor']
    if (!modes.find(e => e === mode)) throw new Error('mode is error')

    return  Math[mode](length / this.c.sizeStep) * this.c.sizeStep
  },

  //удалить последний лист
  deleteLastPlate(dividers = false) {
    this.c.plates.splice(-1)
    dividers && this.c.isChangedDivide.splice(-1)
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
  allItemsDivide(iteration, param = {}) {
    if (param.queue) iteration = 1
    for (let item = 0; item < iteration; item++) {
      divider(this.c)
    }
  },

  //добавить прямоугольник в матрицу
  fillRect(startX, endX, startY, endY, param = {}) {
    const c = this.c,
          {
            index: index = c._currentIndexPlate,
            value: value = 1,
            space: space = false,
            rotate: rotate = false
          } = param
    let addW = 0, addH = space ? 0 : c.eh

    if (rotate) [addW, addH] = [addH, addW]

    for (let x = startX; x < endX + startX + addW; x++) {
      for (let y = startY; y < endY + startY + addH; y++) {
        c.plates[index].matrix[y][x] = value
      }
    }
  },

  //выделить из последнего листа элменты из его части
  selectItemsOfLastParts(plate = this.c.plates.length - 1) {
    let res = [], emptyParts = 0

    for (let step = this.c.config.length - this.c.sizeStep; step >= 0; step -= this.c.sizeStep) {
      for (let item = 0; item < this.c.plates[plate].items.length; item++) {
        const el = this.c.plates[plate].items[item]
        if (el.x + el.w > step && !el.wasSelected) {
          res.push({...el, wasSelected: true})
          this.fillRect(el.x, el.x + el.w, el.y, el.y + el.h, {rotate: el.rotate, value: 0})
          this.c.plates[plate].items.splice(item, 1)
          item--
        }
      }
      if (res.length) break;
      else emptyParts++
    }

    return {items: res.length ? res : false, emptyParts: ++emptyParts}
  },

//поиск неиспользованного пространства
  findUnusedSpace(index = this.c._currentIndexPlate) {
    let c = this.c,
        length = c.plates[index].length, res = [],
        arr = c.plates[index].matrix,
        spaceSymbol = c.plates[index].spaceSymbol === c._startSpaceSymbol ? c._alternateSpaceSymbol : c._startSpaceSymbol

    c.plates[index].spaceSymbol = spaceSymbol

    const findEndY = (startX, startY) => {
      let h = 0, topY = 0
      for (let y = startY; y < this.c.config.height; y++) {
        if (arr[y][startX] === 1) break
        h++
      }
      for (let y = startY - 1; y >= 0; y--) {
        if (arr[y][startX] === 1) break
        topY++
        h++
      }
      return {h, y: topY}
    }
    const findEndX = (startX, startY) => {
      let w = 0
      for (let x = startX; x < length; x++) {
        if (arr[startY][x] === 1) break
        w++
      }
      return w
    }

    //ищем не занятое пространство
    for (let y = 0; y < this.c.config.height; y++) {
      for (let x = 0; x < length; x++) {
        if (arr[y][x] !== 1 && arr[y][x] !== spaceSymbol) {
          const w = findEndX(x, y),
            {h, y: topY} = findEndY(x, y)

          this.fillRect(x, w, y - topY, h, {index, value: spaceSymbol, space: true})
          res.push({x, y: y - topY, w, h})
        }
      }
    }

    return this.c.plates[index].unusedSpace = this.sort(res)
  },

  //сортировка по убыванию
  sort(arr, param = 'w') {
    return arr.sort((a, b) => b[param] - a[param])
  },
  //случайный id
  rndID (length = 5) {
    return Math.random().toString(36).substr(2, length);
  }
}