<!-- # @blog/side-effect

副作用相关代码，主要作用有以下几点：

1. 输出仓库问题列表给 @blog/view 使用
2. 输出 README.md 到根目录 -->

# @blog/rear-end

输出拉取的信息给 @blog/app 消费，分为两种形式使用

- 接口
- json

对于 page.tsx 的数据，通过接口来读取，而对于其他数据可以通过预热接口写到 json 文件来实现。

## 待完成

- 设置略缩图给页面消费
