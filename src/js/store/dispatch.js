import store from "./store"
import {
  ADD_ITEMS_TO_PLATE, ADD_STATE_DATA, CALC_COUNT_PART, CALC_SIZE_STEP, CALC_SUMM_EDGE_HEM, CREATE_NEW_PLATE,
  DELETE_PART_ITEM, EXTRACT_PARTS, FILL_RECT, FIND_UNUSED_SPACE, CALC_CURRENT_LENGTH, GET_MAX_X1, GET_PART_ITEM,
  GET_PARTS_LENGTH, GET_PLATE_ITEMS_LENGTH, GET_STATE, GET_PLATES_LENGTH, GET_UNUSED_SPACE_ITEM,
  GET_UNUSED_SPACE_LENGTH, INITIAL_STATE, IS_CUT, NEXT_INDEX_PLATE, PREPARE_CONFIG_DATA, PUSH_NEW_PLATE,
  REVERSE_UNUSED_SPACE, SELECT_ITEMS_OF_LAST_PART, SET_NEW_LENGTH_PLATE, SET_NEW_UNUSED_SPACE, VALIDATE_CONFIG_DATA,
  GET_CURRENT_INDEX_PLATE, GET_PLATE_ITEM, DELETE_PLATE_ITEM, GET_PLATE_LENGTH, UPDATE_PART_NAME,
  UPDATE_PARTS_INFO_IN_PLATE, DELETE_LAST_PLATE, DIVIDER, DIVISION_OF_PRODUCTS, BASIC_POSITIONING
} from "./actions"
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
import {updatePartNameAC} from "./actionCreators"
import basicPositioning from "../functions/basicPositioning"

function dispatch(action) {
  const state = store.getState(),
    cnf = state.config

  const getIndexPLate = () => action.plate || state.currentIndexPlate

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
    case ADD_STATE_DATA: {
      //добавить данные в стейт
      return store.setState(action.data)
    }
    case CALC_SIZE_STEP: {
      //кратность листа в линейном выражении
      return store.setState({sizeStep: cnf.length * cnf.step})
    }
    case CALC_COUNT_PART: {
      //оно всегда будет очень близко к нужному. на всякий случай
      return store.setState({countPart: Math.round(cnf.length / state.sizeStep)})
    }
    case CALC_SUMM_EDGE_HEM: {
      //сумма кромка + подгиб для удобства
      return store.setState({eh: cnf.edge + cnf.hem})
    }
    //endregion PREPARE DATA

    //region CALCULATE
    case IS_CUT: {
      //делить иделия?
      return cnf.cut
    }
    case DIVIDER: {
      return divider(state.plates, cnf.minPart, cnf.rotate, state.eh, cnf.maxStack, state.symbols.divide, action.items, cnf.length)
    }
    case BASIC_POSITIONING: {
      return basicPositioning(cnf.rotate, state.maxIteration, state.eh, cnf.length)
    }
    case DIVISION_OF_PRODUCTS: {
      return divisionOfProducts(cnf.length, state.sizeStep, state.maxIteration, state.eh, cnf.height)
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
      return state.plates[action.plate].length = action.length
    }
    case GET_CURRENT_INDEX_PLATE: {
      //лист над которым работаем
      return state.currentIndexPlate
    }
    case FIND_UNUSED_SPACE: {
      //поиск неиспользуемых пространств на листе
      return findUnusedSpace(cnf.minPart, state.plates, cnf.height, state.symbols, action.index, action.divideMode)
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
    case REVERSE_UNUSED_SPACE: {
      return state.plates[getIndexPLate()].unusedSpace.reverse()
    }
    case GET_UNUSED_SPACE_LENGTH: {
      return state.plates[getIndexPLate()].unusedSpace.length
    }
    case GET_UNUSED_SPACE_ITEM: {
      return {...state.plates[getIndexPLate()].unusedSpace[action.item]}
    }
    case ADD_ITEMS_TO_PLATE: {
      if (!Array.isArray(action.items)) action.items = [action.items]
      return state.plates[action.plateIdx].items.push(...action.items)
    }
    case FILL_RECT: {
      //добавить прямоугольник в матрицу
      let {
        x, y, w, h,
        index: index = state.currentIndexPlate,
        value: value = 1,
        space: space = false,
        rotate: rotate = false
      } = action.param
      let addW = 0, addH = space ? 0 : state.eh

      if (rotate) [addW, addH, w, h] = [addH, addW, h, w]

      for (let x1 = x; x1 < w + x + addW; x1++) {
        for (let y1 = y; y1 < h + y + addH; y1++) {
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
      return selectItemsOfLastPart(cnf.length, state.sizeStep, state.countPart, state.plates.length - 1, state.eh)
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
            item.name = updatePartNameAC(item, count)
            item.part = count
            item.parts = action.parts
            if (count === action.parts) break cancel
          }
        }
      }
      return
    }
    //endregion CALCULATE
  }
}

export default dispatch