export interface AnalyticsProps {
  site_uv: number;
  page_pv: number;
  version: number;
  site_pv: number;
}
let j = 0;

export const getData = (): Promise<AnalyticsProps> => {
  return new Promise((resolve, reject) => {
    const name = `BusuanziCallback${j++}`;
    // @ts-expect-error 创建一个全局函数给后续的json使用
    window[name] = function (data: any) {
      resolve(data);
    };
    const script = document.createElement('script');
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${name}`;
    script.referrerPolicy = 'unsafe-url';
    // script.referrer = `https://yliu.blog.com${pathname}`;
    script.async = true;
    script.onerror = reject;
    document.body.appendChild(script);

    // window
    //   .fetch(`https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${name}`, {
    //     // 这个固定死，后续就算部署其他域名也不会导致统计数据丢失
    //     // 但是浏览器出于安全考虑不支持这种写法
    //     referrer: `https://yliu.blog.com${pathname}`,
    //     referrerPolicy: 'unsafe-url',
    //     mode: 'no-cors',
    //   })
    //   .then((res) => {
    //     res
    //       .blob()
    //       .then((html) => {
    //         console.log(html.text());

    //         debugger;
    //         // eval(html);
    //       })
    //       .catch(reject);
    //   })
    //   .catch(reject);
  });
};
