export const fnc = {
  bindContext(context) {
    this.c = context
  },
  //создать новый лист
  createNewPlate() {
    this.c.plates.push([])
  },

//поиск неиспользованного пространства
  findUnusedRect(plate) {
    let arr = Array.from(Array(this.c.config.height), () => new Array(this.c.config.length).fill(0)),
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
      for (let y = startY - 1; y > 0; y--) {
        if (arr[y][startX] === 1) break
        topY++
        h++
      }
      return {h, y: topY}
    }
    const findEndX = (startX, startY) => {
      let w = 0
      for (let x = startX; x < this.c.config.length; x++) {
        if (arr[startY][x] === 1) break
        w++
      }
      return w
    }

    //заполянеям массив прямоугольниками
    plate.forEach(rect => {
      fillRect(rect.x, rect.w, rect.y, rect.h + this.c.config.edge + this.c.config.hem, 1)
    })

    //ищем не занятое пространство
    for (let y = 0; y < this.c.config.height; y++) {
      for (let x = 0; x < this.c.config.length; x++) {
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
}