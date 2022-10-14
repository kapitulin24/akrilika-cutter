function validation(data) {
  const errors = []

  if ([
    data.length,
    data.height,
    data.edge,
    data.hem,
    data.minPart,
    data.maxStack
  ].some(e => !Number.isInteger(e) || e <= 0)) {
    errors.push(`Element is not integer or > 0`)
  }
  const notValidElements = data.parts.filter(part => {
    return part.length > data.length * (data.maxStack + 1)
      || part.height > data.height
      || part.length < data.minPart
      || part.height < data.minPart
  })
  if (notValidElements.length) {
    errors.push(`Elements: ${JSON.stringify(notValidElements)} is not valid`)
  }
  const steps = [0.1, 0.2, 0.25, 0.5, 1]
  if (Number.isNaN(data.step) || !steps.find(e => e === data.step)) {
    errors.push(`Step error`)
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
  if (data.parts.filter(e => (
      !e.length || !e.height || !e.count ||
      !Number.isInteger(e.length) || !Number.isInteger(e.height) || !Number.isInteger(e.count) ||
      e.length <= 0 || e.height <= 0 || e.count <= 0
    )
  ).length) {
    errors.push(`parts is not type: {name: String(optional), length: Integer > 0, height: Integer > 0, count: Integer > 0}`)
  }

  return errors
}

export default validation