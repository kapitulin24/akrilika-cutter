//сортировка по убыванию
function decreaseSort(arr, param = 'w') {
  return arr.sort((a, b) => b[param] - a[param])
}

export default decreaseSort