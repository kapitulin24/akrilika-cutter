//текущая используемая длина
function calcCurrentLength(length, sizeStep, mode = 'floor') {
  const modes = ['round', 'ceil', 'floor']
  if (!modes.find(e => e === mode)) throw new Error('mode is error')

  return Math[mode](length / sizeStep) * sizeStep
}

export default calcCurrentLength