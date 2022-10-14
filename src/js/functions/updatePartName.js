//обновить имя изделия
function updatePartName(partName, partItemOrName, part = false) {
  if (typeof partItemOrName === 'string' && part === false) {
    console.warn('props error')
    return
  }

  const name = typeof partItemOrName === 'string' ? partItemOrName : partItemOrName.name,
    regExp = new RegExp(`${partName}.+$`)

  partName = `${partName} ${part === false ? partItemOrName.part : part}`

  return regExp.test(name) ? name.replace(regExp, partName) : `${name} ${partName}`
}

export default updatePartName