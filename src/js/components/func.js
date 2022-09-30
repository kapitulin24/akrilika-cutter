import {divider} from './divider'

export const fnc = {
  bindContext(context) {
    this.c = context
  },
  //создать новый лист
  createNewPlate() {
    let lastPlate = this.c.platesLength.length - 1, isCreated, newLength
    const length = this.c.config.length,
          lastLength = this.c.platesLength[lastPlate] || length

    //если длина последнего листа равна общей длине листа, то создаем новый лист
    if (lastLength === length) {
      this.c.plates.push([])
      this.c.isChanged.push(false)
      this.c.platesLength.push(length)
      isCreated = true
    } else { //иначе добавляем к длине листа кратными частями
      newLength = this.getCurrentLength(lastLength, 'ceil')

      if (newLength === lastLength && newLength < length) {
        newLength = this.getCurrentLength(lastLength + 1, 'ceil')
      }

      this.c.platesLength[lastPlate] = newLength
      isCreated = false
    }
    this.c.unusedRect[this.c.plates.length - 1] = this.findUnusedRect(this.c.plates.length - 1)

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
    this.c.isChanged.splice(-1)
    this.c.platesLength.splice(-1)
    this.c.unusedRect.splice(-1)
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

  //выделить из последнего листа элменты из его части
  selectItemsOfLastParts(plate = this.c.plates.length - 1) {
    let res = [], emptyParts = 0

    for (let step = this.c.config.length - this.c.sizeStep; step >= 0; step -= this.c.sizeStep) {
      for (let item = 0; item < this.c.plates[plate].length; item++) {
        const el = this.c.plates[plate][item]
        if (el.x + el.w > step) {
          res.push(el)
          this.c.plates[plate].splice(item, 1)
          item--
        }
      }
      if (res.length) break;
      else emptyParts++
    }

    return {items: res.length ? res : false, emptyParts: ++emptyParts}
  },

//поиск неиспользованного пространства
  findUnusedRect(index) {
    let length = this.c.platesLength[index]
    let arr = Array.from(Array(this.c.config.height), () => new Array(length).fill(0)),
      res = []

    const fillRect = (startX, endX, startY, endY, value) => {
      for (let x = startX; x < endX + startX; x++) {
        for (let y = startY; y < endY + startY; y++) {
          arr[y][x] = value
        }
      }
    }

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

    //заполянеям массив прямоугольниками
    this.c.plates[index].forEach(rect => {
      let addY = this.c.config.edge + this.c.config.hem, addX = 0
       if (rect.rotate) [addX, addY] = [addY, addX]

      fillRect(rect.x, rect.w + addX, rect.y, rect.h + addY, 1)
    })

    //ищем не занятое пространство
    for (let y = 0; y < this.c.config.height; y++) {
      for (let x = 0; x < length; x++) {
        if (arr[y][x] !== 1 && arr[y][x] !== 2) {
          const w = findEndX(x, y),
            {h, y: topY} = findEndY(x, y)

          fillRect(x, w, y - topY, h, 2)
          res.push({x, y: y - topY, w, h})
        }
      }
    }

    return this.c.unusedRect[index] = res
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