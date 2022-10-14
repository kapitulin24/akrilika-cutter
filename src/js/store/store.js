const initialState = {
  config: {},
  parts: [],
  plates: [],
  time: 0,
  errors: null,
  currentIndexPlate: 0,
  symbols: {
    unusedSpace: 0,
    rect: 1,
    startSpace: 2,
    alternateSpace: 3,
    divide: 4
  },
  sizeStep: null,
  countPart: null,
  eh: null,
  maxIteration: 100 //максимальное количество итераций в цикле while
}

const store = {
  _state: {
  },

  init() {
    this._state = initialState
  },

  getState() {
    return this._state
  },

  getErrors() {
    return this._state.errors
  },

  setState(data) {
    this._state = {...this._state, ...data}
  }
}

window.store = store

export default store