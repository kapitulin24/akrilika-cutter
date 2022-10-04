export function validation(p) {
  if ([
    p.config.length,
    p.config.height,
    p.config.edge,
    p.config.hem,
    p.config.minPart,
    p.config.maxStack
  ].some(e => !Number.isInteger(e) || e <= 0)) {
    p._errors.push(`Element is not integer or > 0`)
  }
  const notValidElements = p.config.parts.filter(part => {
    return part.length > p.config.length * (p.config.maxStack + 1)
      || part.height > p.config.height
      || part.length < p.config.minPart
      || part.height < p.config.minPart
  })
  if (notValidElements.length) {
    p._errors.push(`Elements: ${JSON.stringify(notValidElements)} is not valid`)
  }
  const steps = [0.1, 0.2, 0.25, 0.5]
  if (Number.isNaN(p.config.step) || !steps.find(e => e === p.config.step)) {
    p._errors.push(`Step error`)
  }
  if (p.config.nameIsPrefix !== true && p.config.nameIsPrefix !== false) {
    p._errors.push(`nameIsPrefix is not bool`)
  }
  if (p.config.overLengthFirst !== true && p.config.overLengthFirst !== false) {
    p._errors.push(`overLengthFirst is not bool`)
  }
  if (p.config.rotate !== true && p.config.rotate !== false) {
    p._errors.push(`rotate is not bool`)
  }
  if (p.config.cut !== true && p.config.cut !== false) {
    p._errors.push(`cut is not bool`)
  }
  if (p.config.parts.filter(e => (
      !e.length || !e.height || !e.count ||
      !Number.isInteger(e.length) || !Number.isInteger(e.height) || !Number.isInteger(e.count) ||
      e.length <= 0 || e.height <= 0 || e.count <= 0
    )
  ).length) {
    p._errors.push(`parts is not type: {name: String(optional), length: Integer > 0, height: Integer > 0, count: Integer > 0}`)
  }
}