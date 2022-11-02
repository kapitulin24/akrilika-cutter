function prepareConfig(data) {
  return {
    name: data.name.toString(),
    partName: data.partName.toString(),
    length: +data.length,
    height: +data.height,
    step: +data.step,
    edge: +data.edge,
    hem: +data.hem,
    minPart: +data.minPart,
    maxStack: +data.maxStack,
    optimization: +data.optimization,
    parts: data.parts.map(e => ({
      ...e,
      name: e.name,
      length: +e.length,
      height: +e.height,
      count: +e.count
    })),
    nameIsPrefix: data.nameIsPrefix,
    rotate: data.rotate,
    cut: data.cut
  }
}

export default prepareConfig