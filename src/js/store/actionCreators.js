import dispatch from "./dispatch"
import {
  CALC_COUNT_PART,
  CALC_SIZE_STEP,
  CREATE_NEW_PLATE,
  EXTRACT_PARTS,
  CALC_CURRENT_SIZE,
  GET_PARTS_LENGTH,
  INITIAL_STATE,
  IS_CUT,
  PREPARE_CONFIG_DATA,
  PUSH_NEW_PLATE,
  SET_NEW_SIZE_PLATE,
  VALIDATE_CONFIG_DATA,
  GET_MAX_X1,
  REVERSE_UNUSED_SPACE,
  GET_UNUSED_SPACE_LENGTH,
  GET_UNUSED_SPACE_ITEM,
  GET_PART_ITEM,
  ADD_ITEM_TO_PLATE,
  FILL_RECT,
  GET_PLATE_ITEMS_LENGTH,
  FIND_UNUSED_SPACE,
  GET_PLATES_LENGTH,
  NEXT_INDEX_PLATE,
  DELETE_PART_ITEM,
  SET_NEW_UNUSED_SPACE,
  GET_STATE,
  SELECT_ITEMS_OF_LAST_PART,
  GET_CURRENT_INDEX_PLATE,
  GET_PLATE_ITEM,
  DELETE_PLATE_ITEM,
  GET_PLATE_SIZE,
  UPDATE_PART_NAME,
  UPDATE_PARTS_INFO_IN_PLATE,
  DELETE_LAST_PLATE,
  DIVIDER,
  DIVISION_OF_PRODUCTS,
  BASIC_POSITIONING,
  GET_OPTIMIZATION_LEVEL,
  ADD_STATISTIC,
  GET_CONFIG_DATA,
  GET_USED_PARTS,
  REMOVE_NOT_NEEDED_IN_PLATE,
  CHANGE_ITEM_TO_PLATE,
  CALC_SIZE,
  GET_CURRENT_SIZE,
  GET_UNUSED_PARTS_OF_PLATE
} from './actions'

//region PREPARE DATA
export const stateInitAC = () => dispatch({type: INITIAL_STATE})
export const getStateAC = () => dispatch({type: GET_STATE})
export const validateConfigDataAC = (config) => dispatch({type: VALIDATE_CONFIG_DATA, config})
export const prepareConfigDataAC = (config) => dispatch({type: PREPARE_CONFIG_DATA, config})
export const extractPartsAC = () => dispatch({type: EXTRACT_PARTS})
export const calcSizeAC = () => dispatch({type: CALC_SIZE})
export const calcSizeStepAC = () => dispatch({type: CALC_SIZE_STEP})
export const calcCountPartAC = () => dispatch({type: CALC_COUNT_PART})
//endregion PREPARE DATA

//region CALCULATION
export const getCurrentIndexPlateAC = () => dispatch({type: GET_CURRENT_INDEX_PLATE})
export const nextIndexPlateAC = () => dispatch({type: NEXT_INDEX_PLATE})
export const createNewPlateAC = () => dispatch({type: CREATE_NEW_PLATE})
export const pushNewPlateAC = (plate) => dispatch({type: PUSH_NEW_PLATE, plate})
export const setNewSizePlateAC = (plate, size, cb = () => {}) => dispatch({type: SET_NEW_SIZE_PLATE, plate, size, cb})
export const addItemToPlateAC = (plateIdx, item) => dispatch({type: ADD_ITEM_TO_PLATE, plateIdx, item})
export const changeItemToPlateAC = (plateIdx, item, data) => dispatch({type: CHANGE_ITEM_TO_PLATE, plateIdx, item, data})
export const deletePlateItemAC = (plateIdx, itemIdx) => dispatch({type: DELETE_PLATE_ITEM, plateIdx, itemIdx})
export const getPlateItemsLengthAC = (plate) => dispatch({type: GET_PLATE_ITEMS_LENGTH, plate})
export const getPlatesLengthAC = () => dispatch({type: GET_PLATES_LENGTH})
export const getPlateItemAC = (plateIdx, itemIdx) => dispatch({type: GET_PLATE_ITEM, plateIdx, itemIdx})
export const getPlateSizeAC = (plateIdx) => dispatch({type: GET_PLATE_SIZE, plateIdx})
export const calcCurrentSizeAC = (size, mode) => dispatch({type: CALC_CURRENT_SIZE, size, mode})
export const findUnusedSpaceAC = (index, divideMode) => dispatch({type: FIND_UNUSED_SPACE, index, divideMode})
export const isCutAC = () => dispatch({type: IS_CUT})
export const getPartsLengthAC = () => dispatch({type: GET_PARTS_LENGTH})
export const getMaxX1AC = (plate) => dispatch({type: GET_MAX_X1, plate})
export const reverseUnusedSpaceAC = (plate) => dispatch({type: REVERSE_UNUSED_SPACE, plate})
export const getUnusedSpaceLengthAC = (plate) => dispatch({type: GET_UNUSED_SPACE_LENGTH, plate})
export const getUnusedSpaceItemAC = (item, plate) => dispatch({type: GET_UNUSED_SPACE_ITEM, plate, item})
export const getPartItemAC = (item) => dispatch({type: GET_PART_ITEM, item})
export const fillRectAC = (param) => dispatch({type: FILL_RECT, param})
export const deletePartItemAC = (index) => dispatch({type: DELETE_PART_ITEM, index})
export const setNewUnusedSpaceAC = (plate, value) => dispatch({type: SET_NEW_UNUSED_SPACE, plate, value})
export const selectItemsOfLastPartAC = (index) => dispatch({type: SELECT_ITEMS_OF_LAST_PART, index})
export const updatePartNameAC = (partItemOrName, part) => dispatch({type: UPDATE_PART_NAME, partItemOrName, part})
export const updatePartsInfoInPlateAC = (id, startPart, parts) => dispatch({type: UPDATE_PARTS_INFO_IN_PLATE, id, startPart, parts})
export const deleteLastPlateAC = () => dispatch({type: DELETE_LAST_PLATE})
export const dividerAC = (items) => dispatch({type: DIVIDER, items})
export const divisionOfProductsAC = () => dispatch({type: DIVISION_OF_PRODUCTS})
export const basicPositioningAC = () => dispatch({type: BASIC_POSITIONING})
export const getOptimizationLevelAC = () => dispatch({type: GET_OPTIMIZATION_LEVEL})
export const addStatisticAC = (obj) => dispatch({type: ADD_STATISTIC, obj})
export const getConfigDataAC = (key) => dispatch({type: GET_CONFIG_DATA, key})
export const getCurrentSizeAC = () => dispatch({type: GET_CURRENT_SIZE})
export const getUsedPartsAC = (plate) => dispatch({type: GET_USED_PARTS, plate})
export const removeNotNeededInPlateAC = () => dispatch({type: REMOVE_NOT_NEEDED_IN_PLATE})
export const getUnusedPartsOfPlateAC = (plateIndex) => dispatch({type: GET_UNUSED_PARTS_OF_PLATE, plateIndex})
//endregion CALCULATION