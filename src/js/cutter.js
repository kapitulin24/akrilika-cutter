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
    forDivide: [],
    plates: [],
    errors: [],
    isChangedDivide: [], //изменения на предыдущей итерации при делении изделий
    divideParam: {},
    _currentIndexPlate: 0,
    _symbols: {
      unusedSpace: 0,
      rect: 1,
      startSpace: 2,
      alternateSpace: 3,
      divide: 4
    },
    _startSpaceSymbol: 2,
    _alternateSpaceSymbol: 3,
    _maxIteration: 100 //максимальное количество итераций в цикле while
  }
  //endregion inputData

  validation(data)
  if (data.errors.length) return data

  prepareData(data)

  data.sizeStep = data.config.length * data.config.step //кратность листа в линейном выражении
  data.eh = data.config.edge + data.config.hem
  //вычисление
  calculate(data)

  console.log(data)
  return data
}