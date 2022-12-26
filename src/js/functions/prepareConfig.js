function prepareConfig(data) {
  return {
    name: data.name.toString(),
    partName: data.partName.toString(),
    length: +data.length,
    height: +data.height,
    step: +data.step,
    minPart: +data.minPart,
    maxStack: +data.maxStack,
    optimization: +data.optimization,
    parts: data.parts.map(e => ({
      ...e,
      name: e.name,
      length: +e.length,
      height: +e.height,
      count: +e.count,
      hem: +e.hem,
      edge: +e.edge,
    })),
    nameIsPrefix: data.nameIsPrefix,
    rotate: data.rotate,
    cut: data.cut
  }
}

export default prepareConfig