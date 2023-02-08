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
  getStateAC, getUnusedPartsOfPlateAC, getUsedPartsAC,
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
  if (!isCutAC()) { //если нельзя кроить детали то на всех листах установим правильный использщованный размер
    for (let j = 0; j < getPlatesLengthAC(); j++) {
      setNewSizePlateAC(j, getUnusedPartsOfPlateAC(j))
    }
  } else { //пробуем делить детали, перед этим установим использованный размер на листах, кроме последнего, на максимальную
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
    area = {element: 0, base: 0, hem: 0, edge: 0}, //площадь детали, основания и кромки с подгибом
    perimeter = {element: 0, base: 0, hem: 0, edge: 0}

  //total perimeter and area
  getStateAC().config.parts.forEach(part => {
    const length = part.length * part.count,
          count = part.count * 2

    area.element += length * part.height
    area.base += length * (part.height - part.hem - part.edge)
    area.hem += length * part.hem
    area.edge += length * part.edge

    perimeter.element += (part.length + part.height) * count
    perimeter.base += (part.length + (part.height - part.hem - part.edge)) * count
    perimeter.hem += part.hem ? (part.length + part.hem) * count : 0
    perimeter.edge += part.edge ? (part.length + part.edge) *count : 0
  })

  for (let plate = 0; plate < countOfPlates; plate++) {
    const parts = getUsedPartsAC(plate)
    countOfParts += parts
    totalLength += parts * getStateAC().sizeStep
    countPartsInPlates += parts * getStateAC().config.step

    //add info perimeter and area for product item
    for (let item = 0; item < getPlateItemsLengthAC(plate); item++) {
      const plateItem = getPlateItemAC(plate, item)

      changeItemToPlateAC(plate, item, {
        area: {
          product: {
            element: plateItem.length * plateItem.height,
            base: plateItem.length * (plateItem.height - plateItem.hem - plateItem.edge),
            hem: plateItem.length * plateItem.hem,
            edge: plateItem.length * plateItem.edge
          },
          part: {
            element: plateItem.w * plateItem.h,
            base: plateItem.w * (plateItem.h - plateItem.hem - plateItem.edge),
            hem: plateItem.w * plateItem.hem,
            edge: plateItem.w * plateItem.edge
          }
        },
        perimeter: {
          product: {
            element: (plateItem.length + plateItem.height) * 2,
            base: (plateItem.length + (plateItem.height - plateItem.hem - plateItem.edge)) * 2,
            hem: plateItem.hem ? (plateItem.length + plateItem.hem) * 2 : 0,
            edge: plateItem.edge ? (plateItem.length + plateItem.edge) * 2 : 0
          },
          part: {
            element: (plateItem.w + plateItem.h) * 2,
            base: (plateItem.w + (plateItem.h - plateItem.hem - plateItem.edge)) * 2,
            hem: plateItem.hem ? (plateItem.w + plateItem.hem) * 2 : 0,
            edge: plateItem.edge ? (plateItem.w + plateItem.edge) * 2 : 0
          }
        },
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