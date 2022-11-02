'use strict'

import {
  addStateDataAC,
  basicPositioningAC,
  calcCountPartAC,
  calcSizeStepAC,
  calcSummEdgeHemAC,
  createNewPlateAC,
  divisionOfProductsAC,
  extractPartsAC,
  getLengthAC,
  getOptimizationLevelAC,
  getPlateLengthAC,
  getPlatesLengthAC,
  getStateAC,
  isCutAC,
  prepareConfigDataAC,
  setNewLengthPlateAC,
  stateInitAC,
  validateConfigDataAC
} from './store/actionCreators'

export function cutter(param) {
  const startTime = new Date().getTime()

  //region INPUT DATA
  const data = {
    name: 'name',
    partName: 'part',
    nameIsPrefix: false,
    rotate: false,
    cut: false,
    parts: [], //{name: '', length: 12, height: 500, count: 1} name - опционально
    length: 3660,
    height: 760,
    step: 0.25,
    minPart: 12,
    maxStack: 1,
    optimization: 2,
    edge: 40,
    hem: 40,
    ...param
  }
  //endregion INPUT DATA

  stateInitAC() //state init

  //region VALIDATION
  let errors = validateConfigDataAC(data)
  if (errors.length) return errors
  errors = null
  //endregion VALIDATION

  //region PREPARE DATA
  prepareConfigDataAC(data)
  extractPartsAC()

  calcSizeStepAC()
  calcCountPartAC()
  calcSummEdgeHemAC()
  //endregion PREPARE DATA

  //region CALCULATE
  createNewPlateAC()
  basicPositioningAC()
  if (isCutAC()) {
    //уровень оптимизации
    for (let i = 0; i < getOptimizationLevelAC(); i++) {
      for (let j = 0; j < getPlatesLengthAC() - 1; j++) {
        const length = getLengthAC()
        if (getPlateLengthAC(j) < length) {
          setNewLengthPlateAC(j, length)
        }
      }
      divisionOfProductsAC()
    }
  }
  //endregion CALCULATE

  addStateDataAC({time: (new Date().getTime() - startTime) * 1e-3})

  return getStateAC()
}