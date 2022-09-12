/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "T": () => (/* binding */ LinearCutter)
});

;// CONCATENATED MODULE: ./src/js/components/secondFunctions.js
//вспомогательные функции
function gcd(nod, val) { //функция расчета наибольшего общего делителя
  if (nod < val) [nod, val] = [val, nod];
  while (val) {
    [nod, val] = [val, nod % val];
  }
  return nod;
}

function countOfSameInArray(arr, key = false) { //подсчет одинаковых элемнентов в массиве
  let result = {};
  if (!key) arr.forEach(e => e ? result[e] = result[e] + 1 || 1 : ''); // нулевые не считаем
  else arr.forEach(e => {
    if (!result[e[key]]) result[e[key]] = 0;
    result[e[key]] += e.count !== undefined && +e.count >= 0 ? +e.count : 1;
  }); //для объекта
  return result;
}

function copyObject(obj) {
  if (typeof obj !== 'object') return;

  return JSON.parse(JSON.stringify(obj));
}


;// CONCATENATED MODULE: ./src/js/components/prepareData/input/components/prepareParts.js
const prepareParts = (parts) => { //преобразовываем в массив из массива объектов
  const res = [];
  parts.forEach(e => {
    if (e.count !== 0 && e.length !== 0) {
      const length = res.length;
      res.length += +e.count;
      res.fill(+e.length, length); //и сразу преобразовываем в число
    }
  })
  return res;
};


;// CONCATENATED MODULE: ./src/js/components/prepareData/input/components/prepareStocks.js
const prepareStocks = (stocks, segmentsArr) => { //преобразовываем в массив из массива объектов
  const res = [];
  stocks.forEach(e => {
    if (+e.count !== 0) { //если количество не равно нулю то берем это количество
      const length = res.length;
      res.length += +e.count;
      res.fill(+e.length, length); //и сразу преобразовываем в число
    } else { //если количество не указано или равно 0, то количество заготовок не ограничено
      let tempArr = Array(segmentsArr.length).fill(false), //флаги уже выбранных элементов
        flag, tempBlank, count = 0;
      do { //вычисляем количество заготовок 'жадным' алгоритмом
        flag = false;
        count++;
        tempBlank = +e.length;
        segmentsArr.forEach((item, i) => {
          if (!tempArr[i]) {
            if (tempBlank >= item) {
              tempBlank -= item;
              tempArr[i] = true;
              flag = true;
            }
          }
        })
      } while (flag && tempBlank < +e.length);
      const length = res.length;
      res.length += count;
      res.fill(+e.length, length); //и сразу преобразовываем в число
    }
  });
  return res;
};


;// CONCATENATED MODULE: ./src/js/components/prepareData/input/input.js




//подготовка входящих данных
const prepareInData = (options) => {
  const res = {};
  let parts = options.parts.slice(),
      stocks = options.stocks.slice();

  const transformBool = (value) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value.toLowerCase() === '1';
    } else {
      return value;
    }
  };

  const findGCD = (parts, stocks) => {
    let nod = 0;
    parts.forEach(e => nod = gcd(nod, e));
    stocks.forEach(e => nod = gcd(nod, e));
    return nod;
  };

  if (Object.keys(options).includes('cutWidth')) res.cutWidth = options.cutWidth;
  if (Object.keys(options).includes('cutAngle')) res.cutAngle = options.cutAngle;
  if (Object.keys(options).includes('minRemain')) res.minRemain = options.minRemain;
  if (Object.keys(options).includes('optimization')) res.optimization = options.optimization;
  if (Object.keys(options).includes('oneSide')) res.oneSide = transformBool(options.oneSide);
  if (Object.keys(options).includes('grouping')) res.grouping = transformBool(options.grouping);
  if (Object.keys(options).includes('solution')) res.solution = options.solution;
  if (Object.keys(options).includes('preOptimization')) res.preOptimization = transformBool(options.preOptimization);

  options.remainFirstTotal = []; //остатки
  res.done = [];          //готовые отрезки
  res.notDone = [];   //сюда попадает то, что невозможно сделать
  res.name = options.name;

  let maxBlankLength = 0; //находим максимальную заготовку
  for (let i of stocks) {
    if (i.length > maxBlankLength) {
      maxBlankLength = i.length;
    }
  }

  Object.values(parts).forEach((part, i) => {
    Object.values(stocks).forEach((stock, j) => {
      if (stock && part) {
        //избавляемся от отрезков которые длинее заготовок и добавляем их в массив "не сделано"
        if (+part.length > maxBlankLength) {
          for (let i = 0; i < +part.count; i++) {
            res.notDone.push(part.length);
            parts[i] = false;
          }
        } else if (res.preOptimization) { //избавляемся от отрезков равных заготовке и лежащих в диапазоне от "заготовка минус минимальный отрезок" до "заготовка"
          //диапазон попадания отрезка
          const min = stock.length - options.minRemain - options.cutWidth,
                max = +stock.length;
          if (+part.length >= min && +part.length <= max) {
            //если попал в диапазон
            const remain = stock.length - part.length;
            //добавление в готовые
            const addDone = (count) => {
              const remain = stock.length - part.length,
                    totalL = remain > res.cutWidth ? remain - res.cutWidth : 0,
                    totalP = Math.round((totalL / stock.length) * 10000) / 100;
              for (let i = 0; i < count; i++) {
                res.done.push(
                  {
                    length: +stock.length,
                    cut: [+part.length],
                    remain: {
                      total: {length: totalL, percent: totalP}, //общий
                      balance: {length: 0, percent: 0}, //деловой
                      trash: {length: totalL, percent: totalP}  //мусор
                    }});
              }
            }
            if (stock.count === 0) { //если заготовок бесконечное количество
              addDone(+part.count);
              parts[i] = false;
            } else if (stock.count > 0){ //если заготовки конечны
              const count = stock.count - part.count;
              if (count < 0) {  //если отрезков больше чем заготовок
                addDone(+stock.count);
                stock[j] = false;
                part.count = Math.abs(count);
              } else { //если отрезков меньше или равно заготовкам
                addDone(+part.count);
                part[i] = false;
                count === 0 ? stock[j] = false : stock.count = count;
              }
            }
          }
        }
      }
    })
  })

  parts = Object.values(parts).filter(item => item !== false);
  stocks = Object.values(stocks).filter(item => item !== false);

  res.parts = prepareParts(parts);
  res.stocks = prepareStocks(stocks, res.parts);

  //прибавляем ширину реза
  if (Object.keys(options).includes('cutWidth') && options.cutWidth > 0) {
    res.parts = res.parts.map(e => e + options.cutWidth); //к каждой заготовке добавляем ширину реза
    res.stocks = res.stocks.map(e => e + options.cutWidth); //к каждой заготовке добавляем ширину реза
  }
  //поиск наибольшего общего делителя
  res.nod = findGCD(res.parts, res.stocks);
  if (res.nod > 1) { //если найден делитель
    res.parts = res.parts.map(e => e / res.nod);
    res.stocks = res.stocks.map(e => e / res.nod);
  }
  return res;
}


;// CONCATENATED MODULE: ./src/js/components/validate/validate.js
function LinearCuttingModuleException (message, name) {
  const names = {
    parts: 'parts array',
    stocks: 'stocks array',
    cutWidth: 'cutting width',
    minRemain: 'minimum remain',
    optimization: 'optimization',
    cutAngle: 'cutting angle',
    oneSide: 'oneSide',
    group: 'group',
    solution: 'solution',
    preOptimization: 'preOptimization',
  }
  this.message = message;
  this.name = names[name];
}

//проверка на приходящие данные
function validate(options) {
  const checkName = (name) => {
    if (options[name] === undefined) {
      throw new Error('parameter "name": not found');
    }
  }
  const arrays = (name) => {
    checkName(name);
    if (!options[name].length) {
      throw new LinearCuttingModuleException('Не является масивом, массив пуст или не был передан', name);
    }
    if (options[name].find(e => typeof e !== 'object' || !('length' in e) || !('count' in e))) { //todo переделать! если передан не массив то в этой строке ошибка!
      throw new LinearCuttingModuleException('Переданный массив должен быть вида: [{length: , count: , ...}, ...],', name);
    }
    if (options[name].find(e => Number.isNaN(+e.length) || Number.isNaN(+e.count) || e.length % 1 > 0 || e.count % 1 > 0)) {
      throw new LinearCuttingModuleException('В переданных значениях содержатся дробные числа или текст', name);
    }
    if (options[name].find(e => +e.length < 0 || +e.count < 0)) {
      throw new LinearCuttingModuleException('В переданных значениях содержатся отрицательные числа', name);
    }
  };
  const num = (name, type = 'integer') => {
    checkName(name);
    if ((!Number.isInteger(options[name]) && type === 'integer')) {
      throw new LinearCuttingModuleException('Не является целым числом', name);
    } else if (!Number.isFinite(options[name]) && type === 'float') {
      throw new LinearCuttingModuleException('Не является числом', name);
    }
    if (+options[name] < 0) {
      throw new LinearCuttingModuleException('Не может быть отрицательным числом', name);
    }
  };
  const bool = (name) => {
    checkName(name);
    const str = options[name].toString().toLowerCase();
    if (str !== 'true' && str !== 'false' && str !== '0' && str !== '1') {
      throw new LinearCuttingModuleException('Параметр должен быть булевым значением, 0 или 1', name);
    }
  }
  arrays('parts'); //обязтельное поле
  arrays('stocks');   //обязательное
  Object.keys(options).includes('cutWidth') && num('cutWidth');
  Object.keys(options).includes('minRemain') && num('minRemain');
  Object.keys(options).includes('optimization') && num('optimization');
  if (Object.keys(options).includes('cutAngle')) {
    num('cutAngle');
    if (+options.cutAngle > 89) {
      throw new LinearCuttingModuleException('Не может быть больше 89 градусов', 'cutAngle');
    }
  }
  Object.keys(options).includes('oneSide') && bool('oneSide');
  Object.keys(options).includes('grouping') && bool('grouping');
  Object.keys(options).includes('solution') && num('solution', 'float');
}


;// CONCATENATED MODULE: ./src/js/components/prepareData/output.js


//Подсчет и объединение в группы не сделанных отрезков
function countNotDone(result) {
  if (result.parts.length > 1) {
    const res = countOfSameInArray(result.parts.slice(1)); //подсчет одинаковых элементов
    return Object.keys(res).map(e => {return {length: +e, count: +res[e],}}); //группировка
  } else return [];
}

//подсчет и объединение в группы остатков
function countRemains(used, data) {
  let res = [];
  const countUsed = countOfSameInArray(used, 'length'),
        countInput = countOfSameInArray(data.inputs.stocks, 'length');
  Object.keys(countInput).forEach(item => {
    if (countInput[item].count > 0) {
      res.push({length: +item, count: countInput[item].count - countUsed[item].count})
    } else {
      res.push({length: +item, count: Infinity});
    }
  })
  return res;
}

//объединение в группы раскроя
function countCut (arr) {
  const countSame = arr.reduce((acc, cur) => {
    const count = cur.count || 1;

    cur.count = 1;
    cur = JSON.stringify(cur);
    acc[cur] = acc[cur] ? acc[cur] + count : count;

    return acc;
  }, {});

  return Object.keys(countSame).map(e => {
    const res = JSON.parse(e);
    res.count = countSame[e];
    return res;
  })
}

//подготовка выходных данных
function prepareOutData (res, data) {
  let used, notDone, remains;

  //домножаем на НОД если нужно и отнимаем ширину реза
  if (data.nod > 1 || data.cutWidth > 0) {
    const nod = data.nod, //наибольший общий делитель
          cw = data.cutWidth; //ширина реза

    res.list = res.list.map(e => {
      Object.values(e.remain).forEach(el => {
        el.length = e.length > 0 && e.length > cw ? el.length * nod : 0;
      }); //остатки
      return {
        length: (e.length * nod) - cw,
        cut: e.cut.map(e => (e * nod) - cw),
        remain: e.remain
      }
    });
    //остатки общие
    Object.values(res.remain).forEach(el => {
      el.length *= nod;
      el.all = el.all.map(item => item * nod);
    });
    //заготовки
    res.stocks = res.stocks.map(e => (e * nod) - cw);
    //отрезки
    res.parts = res.parts.map(e => (e * nod) - cw);
  }

  res.list = data.done.concat(res.list);
  let sameListLength = countOfSameInArray(res.list, 'length');

  used = Object.keys(sameListLength).map(e => {return {length: +e, count: sameListLength[e]}});
  notDone = data.notDone.concat(countNotDone(res));
  remains = countRemains(used, data);

  if (data.grouping) {
    res.list = countCut(res.list);
  }
  return {
    list: res.list,
    remain: res.remain,
    name: data.name,
    used,
    notDone,
    remainStocks: remains,
    algo: res.algo
  }
}


;// CONCATENATED MODULE: ./src/js/components/sort.js
/**
 *
 * @param {Array} arr
 * @param {Number} num
 * Принимает массив и его же перемешивает в зависимости от num
 * случайное перемешивание (малоэффиективно, из разряда раз в год и палка стреляет)
 * из-за этой особоенности не имеет смысла ставить в оптимизацию числа намного превышающие переменную random
 * но иногда даёт хорошие результаты
 */
//константы для настройки
const grouping = 12, //больше этого числа будет уже группировка однаковых
      random = 18;   //количество перемешиваний

//перемешивание массива(одна из ключевых функций)
const sort = (arr, num) => {
  arr = [...arr];
  let sameObj = {};
  if (num && num < 5) { //первые 2 раза сортируем массив перед перемешиваем, до этого сортируем без перемешивания
    if (num === 2) {
      arr.sort((a, b) => b - a); //по убыванию
    } else {
      arr.sort((a, b) => a - b); //по возрастанию
    }
  } else if (num > grouping && num <= random) { //больше 12 группируем одинаковые и далее перемешиваем группами
    sameObj = arr.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {});
    arr.splice(0, arr.length);
    Object.keys(sameObj).forEach((e, i) => arr.push(i)) //массив индексов
  }
  if (num > 2 && num % 2) {   //перемешиваем массив
    for(let i = 1; i <= arr.length / 2; i += 2) {
      const j = arr.length - i;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } else if (num > 2) { //перемешиваем по-другому
    arr.unshift(0);
    let b = arr.slice();
    for(let i = 1; i < b.length; i++) {
      if (i % 2) arr[i] = b[(i + 1) / 2]; else arr[i] = b[b.length - i / 2];
    }
    arr.shift();
  }
  if (Object.keys(sameObj).length) {
    const copyArr = arr.slice(),
          length = Object.keys(sameObj);
    arr.splice(0, arr.length);
    copyArr.forEach(e => {
      for (let i = 0; i < sameObj[length[e]]; i++) {
        arr.push(+length[e]);
      }
    });
  } else if (num > random) { //перемешиваем случайно
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}


;// CONCATENATED MODULE: ./src/js/components/algos/components/calcPercent.js

function calcPercent(remain, totalLength) {
  Object.values(remain).forEach(e => {
    e.percent = +((e.length / totalLength) * 100).toFixed(3);
  });
}
;// CONCATENATED MODULE: ./src/js/components/algos/components/addRemain.js

function addRemain(data, remain, stockRemain, curRemain, stock) {
  ['total', curRemain < data.minRemain ? 'trash' : 'balance'].forEach(e => {
    //общий
    remain[e].length += curRemain;
    remain[e].all.push(curRemain);
    //заготовка
    stockRemain[e].length = curRemain;
    stockRemain[e].percent = +((curRemain / stock) * 100).toFixed(3);
  });
}
;// CONCATENATED MODULE: ./src/js/components/algos/matrix.js



const matrix = (stocks, parts, data) => {
  const list = [],      //готовый раскрой
        mtx = [],       //матрица
        max = Math.max(...stocks);
  let remain = { //остаток
                  total: {length: 0, percent: 0, all: []}, //общий
                  balance: {length: 0, percent: 0, all: []}, //деловой
                  trash: {length: 0, percent: 0, all: []}  //мусор
                },
      stockRemain = {
                      total: {length: 0, percent: 0}, //общий
                      balance: {length: 0, percent: 0}, //деловой
                      trash: {length: 0, percent: 0}  //мусор
                     },
      totalLength = 0;

  parts = [0, ...parts];

  //начинаем заполнять матрицу (первая строка и первый столбец)
  mtx.push([1]);
  for (let i = 1; i <= max; i++) mtx[0].push(0);
  for (let i = 1; i <= parts.length - 1; i++) mtx.push([1]);
  //остальные значения матрицы
  for (let i = 1; i <= parts.length - 1; i++) {
    for (let j = 1; j <= max; j++) {
      if (j >= parts[i]) {
        if (mtx[i - 1][j] > mtx[i - 1][j - parts[i]]) mtx[i][j] = mtx[i - 1][j];
        else mtx[i][j] = mtx[i - 1][j - parts[i]];
      } else mtx[i][j] = mtx[i - 1][j];
    }
  }

  for (let iteration = 0; iteration <= stocks.length; iteration++) { //для каждой заготовки подбираем ей отрезки
    if (parts.length === 1) break;                                //до тех пор пока не закончатся отрезки или заготовки
    let sum, currentBlank = stocks[iteration];
    const cut = [], delIndex = [];
    //поиск...
    for (let i = currentBlank; i >= 1; i--) {
      sum = i;
      if (mtx[parts.length - 1][i] === 1) {
        for (let j = parts.length - 1; j >= 1; j--) {
          if (mtx[j][sum] !== mtx[j - 1][sum]  && parts[j] <= currentBlank) { //если найдено
            sum -= parts[j];
            delIndex.push(j);       //добавляем в массив индекс найденого элемента в массиве
            cut.push(parts[j]);  //добавлем элемент в раскрой
            currentBlank -= parts[j];
          }
        }
        break;
      }
    }
    if (cut.length) { //если раскрой был найден
      delIndex.forEach(e => {
        mtx.splice(e, 1); //удаляем строки из матрицы
        parts.splice(e, 1);        //удаляем найденные сегменты
      });
      totalLength += stocks[iteration] - data.cutWidth;
      //добавляем к остаток от текущей заготовки к сумме остатка и мусор/деловой
      addRemain(data, remain, stockRemain, currentBlank, stocks[iteration]);

      list.push({
        length: stocks[iteration],
        cut: cut.sort((a, b) => b - a),
        remain: JSON.parse(JSON.stringify(stockRemain))
      });
    }
  }
  //процент общий
  calcPercent(remain, totalLength);

  return {
    list,
    remain: JSON.parse(JSON.stringify(remain)),
    parts,
    stocks,
    cw: data.cutWidth,
    algo: 'matrix'
  }
}


;// CONCATENATED MODULE: ./src/js/components/algos/greedy.js
//"жадный алгоритм" поиска раскроя



const greedy = (stocks, parts, data) => { //TODO переписать на другой
  let remain = { //остаток
        total: {length: 0, percent: 0, all: []}, //общий
        balance: {length: 0, percent: 0, all: []}, //деловой
        trash: {length: 0, percent: 0, all: []}  //мусор
      },
      stockRemain = {
        total: {length: 0, percent: 0}, //общий
        balance: {length: 0, percent: 0}, //деловой
        trash: {length: 0, percent: 0}  //мусор
      },
      totalLength = 0,
      list = [];
  parts = [0, ...parts]; //копируем массив
  for (let i = 0; i < stocks.length; i++) {
    if (parts.length === 1) break;
    let cut = []; //раскрой
    let currentBlank = stocks[i];
    for (let j = 1; j < parts.length; j++) {
      if (parts[j] <= currentBlank) {
        cut.push(parts[j]);
        currentBlank -= parts[j];
        parts.splice(j, 1);
        j--;
      }
    }
    if (cut.length) {               //если раскрой был найден
      totalLength += stocks[i] - data.cutWidth;
      //добавляем к остаток от текущей заготовки к сумме остатка и мусор/деловой
      addRemain(data, remain, stockRemain, currentBlank, stocks[i]);

      list.push({
          length: stocks[i],
          cut: cut.sort((a, b) => b - a),
          remain: JSON.parse(JSON.stringify(stockRemain))
        });
    }
  }
  //процент общий
  calcPercent(remain, totalLength);

  return {
    list,
    remain: JSON.parse(JSON.stringify(remain)),
    parts, stocks,
    cw: data.cutWidth,
    algo: 'greedy'
  }
}


;// CONCATENATED MODULE: ./src/js/components/algos/summ.js
//алгоритм поиска суммы



const summ = (stocks, parts, data) => {
  let remain = { //остаток
        total: {length: 0, percent: 0, all: []}, //общий
        balance: {length: 0, percent: 0, all: []}, //деловой
        trash: {length: 0, percent: 0, all: []}  //мусор
      },
      stockRemain = {
        total: {length: 0, percent: 0}, //общий
        balance: {length: 0, percent: 0}, //деловой
        trash: {length: 0, percent: 0}  //мусор
      },
      totalLength = 0,
      list = [];
  parts = [...parts];
  const findSumm = (arr, summ, accuracy = 0) => {
    if (!arr || !summ) return;

    let   res = [], inputIndexes = {}, indexes = [], currRemain = summ;
    const newSumm = summ - accuracy,
      item = {},
      find = () => { //поиск сумм
        for (let i = 0; i < arr.length; i++) {
          for (let j = summ - arr[i]; j >= 0; j--) {
            if (item[j] >= 0) {
              const index = j + arr[i];
              if (item[index] === undefined) {
                inputIndexes[index] = i; //собираем индексы
                item[index] = j;         //собираем варианты сумм
              }
              if (index >= newSumm) return;
            }
          }
        }
      },
      getResult = () => { //получаем результат из сумм
        for (let i = summ; i >= 1; i--) {
          if (item[i] >= 0) {
            let index = i;
            do {
              const part = index - item[index];
              res.push(part); //добавляем отрезок в раскрой
              indexes.push(inputIndexes[index]); //добавляем индекс этого элемента в массиве отрезков для последующего удаления из массива
              currRemain -= part; //остаток при раскрое
              index = item[index];
            } while (index)
            return res;
          }
        }
      };

    item[0] = 0;
    find();

    let cut = getResult();

    //добавляем к остаток от текущей заготовки к сумме остатка и мусор/деловой
    if (cut) {
      addRemain(data, remain, stockRemain, currRemain, summ);
      cut = cut.sort((a, b) => b - a); //сортируем по убыванию
    }

    return {length: summ, cut, remain: JSON.parse(JSON.stringify(stockRemain)), indexes}
  }
  //основной цикл
  for (let i = 0; i < stocks.length; i++) {
    if (parts.length === 0) break; //если отрезки закончились то выходим из цикла
    const part = findSumm(parts, stocks[i]); //результат раскроя заготовки
    if (part.cut) { //если решение было найдено
      totalLength += stocks[i] - data.cutWidth;
      part.indexes.forEach(e => parts.splice(e, 1)); //удаляем те отрезки что попали в раскрой из основного массива отрезков
      delete part.indexes; //удялаем индексы из результата раскроя заготовки
      list.push(part); //добавляем в результат
    }
  }

  //процент общий
  calcPercent(remain, totalLength);

  return {
    list,
    remain: JSON.parse(JSON.stringify(remain)),
    parts,
    stocks,
    cw: data.cutWidth,
    algo: 'summ'
  }
}



;// CONCATENATED MODULE: ./src/js/simple.js








/**
 * @param {object} parameters
 * ВАЖНО!!! Все отрезки измеряются по средней линии!
 */

function LinearCutter(parameters) {
  let remain = Infinity; //полный остаток с шириной реза
  let tempRes, res;

  this.init = () => {
    let data = {
      name: 'noName',
      parts: [],
      stocks: [],
      cutWidth: 0,
      minRemain: 0,
      solution: 0, //максимальный процент остатка при котором считаем что решение найдено
      grouping: true,
      optimization: 12,
      preOptimization: false,
      cutAngle: 0,      //TODO еще нужно сделать (влияет на ширину реза)
      oneSide: false,   //TODO если односторонняя заготовка(нужна если рез под углом или ламинат)
    };

    validate(parameters); //проверяет введенные данные
    data = prepareInData({...data, ...parameters});
    data.inputs = parameters;
    calc(data);
  }

  const calc = (data) => { //основной расчет
    let parts = [...data.parts],
        stocks = [...data.stocks];

    for (let i = 1; i <= data.optimization; i++) {  //перебираем заготовоки
      for (let j = 1; j <= data.optimization; j++) { //перебираем отрезки
        for (let i2 = 0; i2 < 3; i2++) {  //перебираем варианты расчета
          for (let i1 = 1; i1 <= i; i1++) {
            stocks = sort(stocks, i1);
          }
          for (let j1 = 1; j1 <= j; j1++) {
            parts = sort(parts, j1);
          }
          switch (i2) {
            case 0:
            default:
              tempRes = greedy(stocks, parts, data); //расчет жадным алгоритмом
              break;
            case 1:
              tempRes =  matrix(stocks, parts, data); //матричный расчет ДП
              break;
            case 2:
              tempRes =  summ(stocks, parts, data); //алгоритм поиска суммы ДП
          }

          if (tempRes.remain.total.length < remain) { //выбираем лучший расчет из алгоритмов
            remain = tempRes.remain.total.length;
            res = prepareOutData(tempRes, data);
          }
        }
      }
    }
  }

  this.getResult = () => {
    return res;
  }

}


var __webpack_exports__LinearCutter = __webpack_exports__.T;
export { __webpack_exports__LinearCutter as LinearCutter };
