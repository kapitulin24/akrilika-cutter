function validation(data) {
  const errors = []

  if ([
    data.length,
    data.height,
    data.minPart
  ].some(e => !Number.isInteger(e) || e <= 0)) {
    errors.push(`Element is not integer`)
  }
  if (data.maxStack < 0 || !Number.isInteger(data.maxStack)) {
    errors.push(`Max Stack is not valid`)
  }
  if (data.optimization < 0 || !Number.isInteger(data.optimization) || data.optimization > 10) {
    errors.push(`Optimization level is not valid`)
  }
  if (data.parts.filter(e => (
      e.length === undefined  || e.height === undefined || e.count === undefined || e.hem === undefined || e.edge === undefined ||
      !Number.isInteger(e.length) || !Number.isInteger(e.height) || !Number.isInteger(e.count) || !Number.isInteger(e.hem) || !Number.isInteger(e.edge) ||
      e.length <= 0 || e.height <= 0 || e.count <= 0 || e.hem < 0 || e.edge < 0
    )
  ).length) {
    errors.push(`Parts is not valid`)
  }

  const notValidElements = data.parts.filter(part => {
    return part.length > data.length * (data.maxStack + 1)
      || part.height > data.height - part.hem - part.edge
      || part.length < data.minPart
      || part.height < data.minPart
  })
  if (notValidElements.length) {
    errors.push(`Parts is not valid (diapason)`)
  }
  const steps = [0.1, 0.2, 0.25, 0.5, 1]
  if (Number.isNaN(data.step) || !steps.find(e => e === data.step)) {
    errors.push(`Step is not valid`)
  }
  if (data.nameIsPrefix !== true && data.nameIsPrefix !== false) {
    errors.push(`nameIsPrefix is not bool`)
  }
  if (data.rotate !== true && data.rotate !== false) {
    errors.push(`rotate is not bool`)
  }
  if (data.cut !== true && data.cut !== false) {
    errors.push(`cut is not bool`)
  }
  if (data.showPartInName !== true && data.showPartInName !== false) {
    errors.push(`showPartInName is not bool`)
  }
  if (data.getAllData !== true && data.getAllData !== false) {
    errors.push(`getAllData is not bool`)
  }
  if (data.prepareOutputPlates !== true && data.prepareOutputPlates !== false) {
    errors.push(`prepareOutputPlates is not bool`)
  }
  if (data.axisX !== true && data.axisX !== false) {
    errors.push(`axisX is not bool`)
  }

  return errors
}

export default validation