import {divider} from './divider'

export const fnc = {
  bindContext(context) {
    this.c = context
  },
  //создать новый лист
  createNewPlate() {
    this.c.plates.push([])
    this.c.isChanged.push(false)
  },

  //удалить последний лист
  deleteLastPlate(dividers = false) {
    this.c.plates.splice(-1)
    this.c.isChanged.splice(-1)
    dividers && this.c.isChangedDivide.splice(-1)
  },

  //сравнить массивы
  compareArr(arr1, arr2, notLast = false) {
    if (arr1.length !== arr2.length) return false

    //if (notLast && arr2[arr2.length -1] === true) return true
    for (let i in arr1) {
      if (arr1[i] !== arr2[i]) return false
    }
    return true
  },

  //разделить элементы
  allItemsDivide(iteration, param = {}) {
    if (param.queue) iteration = 1
    for (let item = 0; item < iteration; item++) {
      divider(this.c, param)
    }
  },

  //выделить из последнего листа элменты из его части
  selectItemsOfLastParts(plate = this.c.plates.length - 1) {
    const s = this.c.config.step * this.c.config.length
    let res = [], emptyParts = 0

    for (let step = this.c.config.length - s; step >= 0; step -= s) {
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
  findUnusedRect(plate, length = this.c.config.length, height = this.c.config.height) {
    let arr = Array.from(Array(height), () => new Array(length).fill(0)),
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
      for (let y = startY; y < height; y++) {
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
    plate.forEach(rect => {
      let addY = this.c.config.edge + this.c.config.hem, addX = 0
       if (rect.rotate) [addX, addY] = [addY, addX]

      fillRect(rect.x, rect.w + addX, rect.y, rect.h + addY, 1)
    })

    //ищем не занятое пространство
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < length; x++) {
        if (arr[y][x] !== 1 && arr[y][x] !== 2) {
          const w = findEndX(x, y),
            {h, y: topY} = findEndY(x, y)

          fillRect(x, w, y - topY, h, 2)
          res.push({x, y: y - topY, w, h})
        }
      }
    }
    return res
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