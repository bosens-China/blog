媒体查询，根据屏幕信息的不同加载特定的样式，在 css 中我们经常使用，不过很多时候需要用到 js 的功能，下面就来介绍一下`MediaQueryList`

## MediaQueryList

![](/1.png)
MediaQueryList 是实验性的语法，简单来说就是让 js 拥有媒体查询的功能

### 方法

- void addListener(MediaQueryListListener listener);
  添加一个监视器，如果存在将忽略
- void removeListener(MediaQueryListListener listener);
  移除监视器

### 属性

| 属性名  | 类型      | 描述                                                                        |
| ------- | --------- | --------------------------------------------------------------------------- |
| matches | boolean   | 如果当前 document 匹配该媒体查询列表则其值为 true；反之其值为 false。只读。 |
| media   | DOMString | 序列化的媒体查询列表                                                        |
