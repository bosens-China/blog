export const arrayLength = (par: any) => Array.isArray(par) && par.length;

// 替换非法字符
export const illegalReplace = (par: string) => {
  const reg = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;
  return par.replace(reg, "");
};
