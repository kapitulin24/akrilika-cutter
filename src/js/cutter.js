'use strict'

import {
  addStatisticAC,
  basicPositioningAC,
  calcCountPartAC, calcSizeAC,
  calcSizeStepAC,
  changeItemToPlateAC,
  createNewPlateAC,
  divisionOfProductsAC,
  extractPartsAC, getConfigDataAC, getCurrentSizeAC,
  getOptimizationLevelAC, getPlateItemAC, getPlateItemsLengthAC,
  getPlateSizeAC,
  getPlatesLengthAC,
  getStateAC, getUsedPartsAC,
  isCutAC,
  prepareConfigDataAC, removeNotNeededInPlateAC,
  setNewSizePlateAC,
  stateInitAC,
  validateConfigDataAC
} from './store/actionCreators'
import store from './store/store'

export function cutter(param) {
  const startTime = new Date().getTime()

  //region INPUT DATA
  const data = {
    name: 'name',
    partName: 'part',
    nameIsPrefix: false,
    rotate: false,
    cut: false,
    showPartInName: true,
    parts: [], //{name: '', length: 12, height: 500, count: 1, edge: 40, hem: 40} name - опционально
    length: 3660,
    height: 760,
    step: 0.25,
    minPart: 12,
    maxStack: 1,
    optimization: 2,
    prepareOutputPlates: true, //c преобразованием выходных данных
    getAllData: false, //получить все данные
    axisX: true,
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

  calcSizeAC()
  calcSizeStepAC()
  calcCountPartAC()
  //endregion PREPARE DATA

  //region CALCULATE
  createNewPlateAC()
  basicPositioningAC()
  if (isCutAC()) {
    //уровень оптимизации
    for (let i = 0; i < getOptimizationLevelAC(); i++) {
      for (let j = 0; j < getPlatesLengthAC() - 1; j++) {
        const size = getCurrentSizeAC()
        if (getPlateSizeAC(j) < size) {
          setNewSizePlateAC(j, size)
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
    area += (part.length * part.height) * part.count
    perimeter += (part.length + part.height) * 2 * part.count
  }, 0)

  for (let plate = 0; plate < countOfPlates; plate++) {
    const parts = getUsedPartsAC(plate)
    countOfParts += parts
    totalLength += parts * getStateAC().sizeStep
    countPartsInPlates += parts * getStateAC().config.step

    //add info perimeter and area for product item
    for (let item = 0; item < getPlateItemsLengthAC(plate); item++) {
      const plateItem = getPlateItemAC(plate, item)

      changeItemToPlateAC(plate, item, {
        area: plateItem.w * plateItem.h,
        perimeter: (plateItem.w + plateItem.h) * 2
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

  if (getConfigDataAC('prepareOutputPlates')) {
    removeNotNeededInPlateAC()
  }

  if (getConfigDataAC('getAllData')) {
    return getStateAC()
  } else {
    return {
      config: getConfigDataAC(),
      plates: getStateAC().plates,
      statistic: getStateAC().statistic,
      countPart: getStateAC().countPart,
      mainSize: getStateAC().size,
      errors: getStateAC().errors,
      sizeStep: getStateAC().sizeStep
    }
  }
}