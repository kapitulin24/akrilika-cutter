'use strict'

import {validation} from './components/validation'
import {prepareData} from './components/prepareData'
import {calculate} from './components/calculation'

export function cutter(param) {
  //region inputData
  const data = {
    config: {
      name: 'name',
      partName: 'part',
      nameIsPrefix: false,
      overLengthFirst: false,
      rotate: false,
      cut: false,
      parts: [], //{name: '', length: 12, height: 500, count: 1} name - опционально
      length: 3660,
      height: 760,
      step: 0.25,
      minPart: 12,
      maxStack: 1,
      edge: 40,
      hem: 40,
      ...param
    },
    parts: [],
    partsSorted: [],
    unusedRect: [],
    forDivide: [],
    plates: [[]], //начинаем с одного листа (массив внутри)
    errors: [],
    isChanged: [false], //вносились ли изменения на лист в текущей итерации
    isChangedDivide: [], //изменения на предыдущей итерации при делении изделий
    divideParam: {},
    maxIteration: 100 //максимальное количество итераций в цикле while
  }
  //endregion inputData

  validation(data)
  if (data.errors.length) return data

  prepareData(data)

  //вычисление
  calculate(data)

  return data
}