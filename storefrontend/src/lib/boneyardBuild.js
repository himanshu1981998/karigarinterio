export const isBoneyardBuild = () =>
  typeof window !== "undefined" && window.__BONEYARD_BUILD === true
