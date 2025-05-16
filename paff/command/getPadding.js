// todo: 暂时未考虑多个页面实例的情况

let $padding= null

export const getPadding = (padding) => {
  if (padding) $padding = padding
  return $padding
}
