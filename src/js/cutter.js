'use strict'

import {
  addStatisticAC,
  basicPositioningAC,
  calcCountPartAC,
  calcSizeStepAC,
  calcSummEdgeHemAC, changeItemToPlateAC,
  createNewPlateAC,
  divisionOfProductsAC,
  extractPartsAC, getConfigDataAC,
  getOptimizationLevelAC, getPlateItemAC, getPlateItemsLengthAC,
  getPlateLengthAC,
  getPlatesLengthAC,
  getStateAC, getUsedPartsAC,
  isCutAC,
  prepareConfigDataAC, removeNotNeededInPlateAC,
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
        const length = getConfigDataAC('length')
        if (getPlateLengthAC(j) < length) {
          setNewLengthPlateAC(j, length)
        }
      }
      divisionOfProductsAC()
    }
  }
  //endregion CALCULATE

  //region STATISTIC
  let countOfParts = 0,
      totalLength = 0,
      countOfPlates = getPlatesLengthAC(),
      countPartsInPlates = 0,
      area = 0,
      perimeter = 0

  //perimeter and area
  getStateAC().config.parts.forEach(part => {
    const height = part.height + getStateAC().eh
    area += (part.length * height) * part.count
    perimeter += (part.length + height) * 2 * part.count
  }, 0)

  for (let plate = 0; plate < countOfPlates; plate++) {
    const parts = getUsedPartsAC(plate)
    countOfParts += parts
    totalLength += parts * getStateAC().sizeStep
    countPartsInPlates += parts * getStateAC().config.step

    //add info perimeter and area for product item
    for (let item = 0; item < getPlateItemsLengthAC(plate); item++) {
      const plateItem = getPlateItemAC(plate, item),
            height = plateItem.h + getStateAC().eh

      changeItemToPlateAC(plate, item, {
        area: plateItem.w * height,
        perimeter: (plateItem.w + height) * 2
      })
    }
  }

  addStatisticAC({
    countOfParts,
    totalLength,
    countOfPlates,
    countPartsInPlates,
    perimeter,
    area,
    time: (new Date().getTime() - startTime) * 1e-3
  })
  //endregion STATISTIC

  removeNotNeededInPlateAC()

  return {
    config: getStateAC().config,
    plates: getStateAC().plates,
    statistic: getStateAC().statistic,
    countPart: getStateAC().countPart,
    errors: getStateAC().errors,
    sizeStep: getStateAC().sizeStep,
  }
}