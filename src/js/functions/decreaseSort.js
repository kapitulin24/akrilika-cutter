//сортировка по убыванию
function decreaseSort(arr, param = 'w') {
  if (param) {
    return arr.sort((a, b) => b[param] - a[param])
  } else {
    return arr.sort((a, b) => b - a)
  }
}

export default decreaseSort