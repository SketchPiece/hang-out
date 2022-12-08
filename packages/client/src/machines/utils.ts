export const getGlobalTime = (delta = 0) => {
  const date = new Date()
  const time = date.getTime() / 1000
  return time + delta
}