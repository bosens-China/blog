export const htmlToString = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent;
};

export const htmlToImg = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return [...div.querySelectorAll('img')]
    .map((item: HTMLImageElement | null) => {
      return item?.getAttribute('src');
    })
    .filter((f): f is string => !!f);
};
