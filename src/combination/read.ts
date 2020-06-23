import { instance, ISSUES } from "../API";

const params = {
  page: 1,
  state: "open",
  per_page: 20
};
// 获取ISSUES文章，默认重试一次
async function getBlog() {
  let data;
  try {
    data = await instance({
      url: ISSUES,
      data: params
    });
  } catch (e) {
    data = await instance({
      url: ISSUES,
      data: params,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
      }
    });
  }
  params.page += 1;
  return data as any;
}
// 获取全部
async function getBlogWhole() {
  const arr = [];
  let data = [];
  // 因为github的api没有返回总数，必须要调用循环一次次的循环
  do {
    data = await getBlog();
    arr.push(...data);
  } while (Array.isArray(data) && data.length);
  return arr;
}

export default getBlogWhole;
