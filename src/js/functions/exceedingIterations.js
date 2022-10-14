//превышение итераций
function exceedingIterations(countIteration, maxIteration) {
  if (countIteration > maxIteration) {
    console.warn(`calculation aborted (iteration > ${maxIteration})`)
    return true
  }
  return false
}

export default exceedingIterations