import read from "./combination/read";
import format from "./combination/format";
import addType from "./combination/addType";
import write from "./combination/write";
import { retry } from "./config";

async function main() {
  let blog: any[] = [];
  // 对于网络错误可以允许重试，其他错误就报告出来
  for (let i = 0; i < retry; i += 1) {
    try {
      blog = await read();
      break;
    } catch (e) {
      console.log(e);
    }
  }
  const glogArr = format(blog).getDate();
  await addType(glogArr);
  const log = await write(glogArr);
  console.log(`执行完成:\n\n${log}`);
}

main();
