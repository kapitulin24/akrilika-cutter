//текущая используемая длина
function calcCurrentSize(size, sizeStep, mode = 'floor') {
  const modes = ['round', 'ceil', 'floor']
  if (!modes.find(e => e === mode)) throw new Error('mode is error')

  return Math[mode](size / sizeStep) * sizeStep
}

export default calcCurrentSize