import { USER, special, defaultIem } from "../config";
import { arrayLength } from "../utils";
import { Ilabel } from "../../typings/main";

class Format {
  private data!: any;
  private label!: Ilabel;

  public constructor(data: any) {
    this.data = data;
    this.label = new Map();
    this.setList();
  }

  public getDate() {
    return this.label;
  }

  private setList() {
    const arr = this.data;
    // 不做任何处理
    if (!arrayLength(arr)) {
      return;
    }
    // 过滤一些机器人等...
    const data = arr.filter((f: any) => {
      const { user: { login } = {} as any } = f;
      return login === USER;
    });
    // 按照发布的时间把数组排序一下，这里暂时不排序了，因为要显示最新的文章
    // data.sort((x, y) => x.number - y.number);
    this.data = data;
    this.setLabel();
  }

  private setLabel() {
    const { data, label } = this;
    for (const item of data) {
      const { title, html_url: url, number: sort, id, labels } = item;
      const obj = {
        id,
        title,
        url,
        sort
      };
      // 如果是0加入到其他中，说明不存在任何标签，加入到其他里面
      if (!labels.length) {
        if (!label.has(defaultIem)) {
          label.set(defaultIem, []);
        }
        label.get(defaultIem).push(obj);
      } else {
        labels.forEach((f: any) => {
          const { name } = f;
          if (!label.has(name)) {
            label.set(name, []);
          }
          label.get(name).push(obj);
        });
      }
    }
    this.sortLabel();
  }

  // 排序，这里作用就是让 未完成放置到最后面，其他原封不动
  private sortLabel() {
    const { label } = this;
    const toBecompleted = label.get(special);
    if (!arrayLength(toBecompleted)) {
      return;
    }
    // 删除
    label.delete(special);
    label.set(special, toBecompleted);
  }
}

function format(data: any) {
  return new Format(data);
}

export default format;
