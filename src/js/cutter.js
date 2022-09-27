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
    overlengths: [],
    plates: [[]], //начинаем с одного листа (массив внутри)
    errors: [],
    maxIteration: 1000 //максимальное количество итераций в цикле while
  }
  //endregion inputData

  validation(data)
  if (data.errors.length) return data

  prepareData(data)

  //вычисление
  calculate(data)

  return data
}