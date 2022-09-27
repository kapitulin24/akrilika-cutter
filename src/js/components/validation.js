export function validation(p) {
  if ([
    p.config.length,
    p.config.height,
    p.config.edge,
    p.config.hem,
    p.config.minPart,
    p.config.maxStack
  ].some(e => !Number.isInteger(e) || e <= 0)) {
    p.errors.push(`Element is not integer or > 0`)
  }
  const notValidElements = p.config.parts.filter(part => {
    return part.length > p.config.length * (p.config.maxStack + 1)
      || part.height > p.config.height
      || part.length < p.config.minPart
      || part.height < p.config.minPart
  })
  if (notValidElements.length) {
    p.errors.push(`Elements: ${JSON.stringify(notValidElements)} is not valid`)
  }
  if (Number.isNaN(p.config.step) || p.config.step <= 0 || p.config.step > 0.5) {
    p.errors.push(`Step error`)
  }
  if (p.config.nameIsPrefix !== true && p.config.nameIsPrefix !== false) {
    p.errors.push(`nameIsPrefix is not bool`)
  }
  if (p.config.overLengthFirst !== true && p.config.overLengthFirst !== false) {
    p.errors.push(`overLengthFirst is not bool`)
  }
  if (p.config.rotate !== true && p.config.rotate !== false) {
    p.errors.push(`rotate is not bool`)
  }
  if (p.config.parts.filter(e => (
      !e.length || !e.height || !e.count ||
      !Number.isInteger(e.length) || !Number.isInteger(e.height) || !Number.isInteger(e.count) ||
      e.length <= 0 || e.height <= 0 || e.count <= 0
    )
  ).length) {
    p.errors.push(`parts is not type: {name: String(optional), length: Integer > 0, height: Integer > 0, count: Integer > 0}`)
  }
}