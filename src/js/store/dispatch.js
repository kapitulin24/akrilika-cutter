import store from "./store"
import {
  ADD_ITEM_TO_PLATE,
  CALC_COUNT_PART,
  CALC_SIZE_STEP,
  CREATE_NEW_PLATE,
  DELETE_PART_ITEM,
  EXTRACT_PARTS,
  FILL_RECT,
  FIND_UNUSED_SPACE,
  CALC_CURRENT_LENGTH,
  GET_MAX_X1,
  GET_PART_ITEM,
  GET_PARTS_LENGTH,
  GET_PLATE_ITEMS_LENGTH,
  GET_STATE,
  GET_PLATES_LENGTH,
  GET_UNUSED_SPACE_ITEM,
  GET_UNUSED_SPACE_LENGTH,
  INITIAL_STATE,
  IS_CUT,
  NEXT_INDEX_PLATE,
  PREPARE_CONFIG_DATA,
  PUSH_NEW_PLATE,
  REVERSE_UNUSED_SPACE,
  SELECT_ITEMS_OF_LAST_PART,
  SET_NEW_LENGTH_PLATE,
  SET_NEW_UNUSED_SPACE,
  VALIDATE_CONFIG_DATA,
  GET_CURRENT_INDEX_PLATE,
  GET_PLATE_ITEM,
  DELETE_PLATE_ITEM,
  GET_PLATE_LENGTH,
  UPDATE_PART_NAME,
  UPDATE_PARTS_INFO_IN_PLATE,
  DELETE_LAST_PLATE,
  DIVIDER,
  DIVISION_OF_PRODUCTS,
  BASIC_POSITIONING,
  GET_OPTIMIZATION_LEVEL,
  ADD_STATISTIC,
  GET_CONFIG_DATA,
  GET_USED_PARTS, REMOVE_NOT_NEEDED_IN_PLATE, CHANGE_ITEM_TO_PLATE
} from './actions'
import validation from "../functions/validation"
import prepareConfig from "../functions/prepareConfig"
import extractParts from "../functions/extractParts"
import calcCurrentLength from "../functions/calcCurrentLength"
import findUnusedSpace from "../functions/findUnusedSpace"
import createNewPlate from "../functions/createNewPlate"
import selectItemsOfLastPart from "../functions/selectItemsOfLastPart"
import updatePartName from "../functions/updatePartName"
import {divider} from "../functions/divider"
import divisionOfProducts from "../functions/divisionOfProducts"
import {calcCurrentLengthAC, fillRectAC, findUnusedSpaceAC, updatePartNameAC} from './actionCreators'
import basicPositioning from "../functions/basicPositioning"

function dispatch(action) {
  const state = store.getState(),
    cnf = state.config

  const getIndexPLate = () => action.plate >= 0 ? action.plate : state.currentIndexPlate

  switch (action.type) {
    //region PREPARE DATA
    case INITIAL_STATE: {
      //инициализация стейта
      return store.init()
    }
    case GET_STATE: {
      //инициализация стейта
      return state
    }
    case VALIDATE_CONFIG_DATA: {
      //валидация
      store.setState({errors: validation(action.config)})
      return store.getErrors()
    }
    case PREPARE_CONFIG_DATA: {
      //подготовить данные конфига
      return store.setState({config: prepareConfig(action.config)})
    }
    case EXTRACT_PARTS: {
      //извлечь изделия с некоторыми преобразованиями
      return store.setState({parts: extractParts(cnf.parts, cnf.name, cnf.length, cnf.partName, cnf.nameIsPrefix, cnf.minPart)})
    }
    case CALC_SIZE_STEP: {
      //кратность листа в линейном выражении
      return store.setState({sizeStep: cnf.length * cnf.step})
    }
    case CALC_COUNT_PART: {
      //оно всегда будет очень близко к нужному. на всякий случай
      return store.setState({countPart: Math.round(cnf.length / state.sizeStep)})
    }
    case GET_CONFIG_DATA: {
      //данные конфига
      return cnf.hasOwnProperty(action.key) ? cnf[action.key] : cnf
    }
    case ADD_STATISTIC: {
      //добавить статистику
      if (typeof action.obj !== 'object') throw new Error('object error')

      const statistic = {
        ...state.statistic,
        ...action.obj
      }
      return store.setState({statistic})
    }
    //endregion PREPARE DATA

    //region CALCULATE
    case IS_CUT: {
      //делить иделия?
      return cnf.cut
    }
    case DIVIDER: {
      return divider(state.plates, cnf.minPart, cnf.rotate, cnf.maxStack, state.symbols.divide, action.items, cnf.length, state.symbols.unusedSpace)
    }
    case BASIC_POSITIONING: {
      return basicPositioning(cnf.rotate, state.maxIteration, cnf.length)
    }
    case DIVISION_OF_PRODUCTS: {
      return divisionOfProducts(cnf.length, state.sizeStep, state.maxIteration, cnf.height, state.symbols.unusedSpace, state.config.showPartInName)
    }
    case PUSH_NEW_PLATE: {
      //пушим новый лист
      return store.setState({plates: [...state.plates, action.plate]})
    }
    case CREATE_NEW_PLATE: {
      //создать новый лист
      return createNewPlate(state.plates, cnf.length, cnf.height, state.symbols.startSpace, state.symbols.unusedSpace)
    }
    case CALC_CURRENT_LENGTH: {
      //текущая используемая длина листа
      return calcCurrentLength(action.length, state.sizeStep, action.mode)
    }
    case SET_NEW_LENGTH_PLATE: {
      //изменить длину листа
      if (typeof action.cb !== 'function') throw new Error('cb is not a function')

      const length = state.plates[action.plate].length = action.length
      action.cb()
      findUnusedSpaceAC(action.plate)
      return length
    }
    case GET_CURRENT_INDEX_PLATE: {
      //лист над которым работаем
      return state.currentIndexPlate
    }
    case FIND_UNUSED_SPACE: {
      //поиск неиспользуемых пространств на листе
      return findUnusedSpace(cnf.minPart, state.plates, cnf.height, state.symbols, action.index, action.divideMode)
    }
    case GET_OPTIMIZATION_LEVEL: {
      //уровень оптимизации
      return cnf.optimization
    }
    case GET_PARTS_LENGTH: {
      return state.parts.length
    }
    case GET_PART_ITEM: {
      return {...state.parts[action.item]}
    }
    case GET_MAX_X1: {
      return Math.max(...state.plates[getIndexPLate()].items.map(e => e.x + e.w), 0)
    }
    case GET_USED_PARTS: {
      let length
      if (state.plates[action.plate].length === cnf.length) {
        let maxUnused = 0
        state.plates[action.plate].unusedSpace.forEach(e => {
          if (e.h === cnf.height && maxUnused < e.x) {
            maxUnused = e.x
          }
        })
        length = calcCurrentLengthAC(maxUnused === 0 ? cnf.length : maxUnused, 'ceil')
      } else {
        length = state.plates[action.plate].length
      }

      return Math.round(length / state.sizeStep)
    }
    case REVERSE_UNUSED_SPACE: {
      return state.plates[getIndexPLate()].unusedSpace.reverse()
    }
    case GET_UNUSED_SPACE_LENGTH: {
      return state.plates[getIndexPLate()].unusedSpace.length
    }
    case GET_UNUSED_SPACE_ITEM: {
      return {...state.plates[getIndexPLate()].unusedSpace[action.item]}
    }
    case ADD_ITEM_TO_PLATE: {
      const {x, w, y, h, rotate, fromPlate: index} = action.item
      fillRectAC({x, w, y, h, rotate, index})
      return state.plates[action.plateIdx].items.push(action.item)
    }
    case CHANGE_ITEM_TO_PLATE: {
      //если вдруг кто-то решит изменить то что нельзя
      ['x', 'w', 'y', 'h', 'rotate', 'fromPlate', 'id', 'height', 'length', 'count', 'part', 'parts', 'name', 'hem', 'edge'].forEach(e => {
        if (action.data.hasOwnProperty(e)) {
          delete action.data[e]
          console.warn(`key ${e} is forbidden`)
        }
      })

      return state.plates[action.plateIdx].items[action.item] = {
        ...state.plates[action.plateIdx].items[action.item],
        ...action.data
      }
    }
    case FILL_RECT: {
      //добавить прямоугольник в матрицу
      let {
        x, y, w, h,
        index: index = state.currentIndexPlate,
        value: value = 1,
        rotate: rotate = false
      } = action.param

      if (rotate) [w, h] = [h, w]

      for (let x1 = x; x1 < w + x; x1++) {
        for (let y1 = y; y1 < h + y; y1++) {
          state.plates[index].matrix[y1][x1] = value
        }
      }
      return
    }
    case DELETE_PART_ITEM: {
      return state.parts.splice(action.index, 1)
    }
    case GET_PLATE_ITEMS_LENGTH: {
      return state.plates[getIndexPLate()].items.length
    }
    case GET_PLATES_LENGTH: {
      return state.plates.length
    }
    case NEXT_INDEX_PLATE: {
      return ++state.currentIndexPlate
    }
    case SET_NEW_UNUSED_SPACE: {
      return state.plates[getIndexPLate()].unusedSpace = action.value
    }
    case GET_PLATE_ITEM: {
      return {...state.plates[action.plateIdx].items[action.itemIdx]}
    }
    case DELETE_PLATE_ITEM: {
      return state.plates[action.plateIdx].items.splice(action.itemIdx, 1)
    }
    case GET_PLATE_LENGTH: {
      return state.plates[action.plateIdx].length
    }
    case SELECT_ITEMS_OF_LAST_PART: {
      return selectItemsOfLastPart(cnf.length, state.sizeStep, state.countPart, action.index)
    }
    case UPDATE_PART_NAME: {
      return updatePartName(cnf.partName, action.partItemOrName, action.part)
    }
    case DELETE_LAST_PLATE: {
      return state.plates.splice(-1)
    }
    case UPDATE_PARTS_INFO_IN_PLATE: {
      let count = action.startPart
      cancel: for (let i in state.plates) {
        for (let j in state.plates[i].items) {
          const item = state.plates[i].items[j]
          if (item.id === action.id) {
            ++count
            state.config.showPartInName && (item.name = updatePartNameAC(item, count))
            item.part = count
            item.parts = action.parts
            if (count === action.parts) break cancel
          }
        }
      }
      return
    }
    //endregion CALCULATE
    case REMOVE_NOT_NEEDED_IN_PLATE: {
      return state.plates = state.plates.map(plate => plate.items)
    }
  }
}

export default dispatch