<!-- # @blog/side-effect

副作用相关代码，主要作用有以下几点：

1. 输出仓库问题列表给 @blog/view 使用
2. 输出 README.md 到根目录 -->

# @blog/rear-end

输出拉取的信息给 @blog/app 消费，通过 json 文件分发信息，如果给 nextjs client 使用则使用 [TypeGraphQL](https://typegraphql.com/) 控制体积。

## 待完成

- 设置略缩图给页面消费
- 图片压缩
- 清理临时目录

## env

| 名称              | 是否必填 |                                                              描述 |
| ----------------- | :------: | ----------------------------------------------------------------: |
| GITHUB_REPOSITORY |    是    | 要拉取的 github 仓库信息，它是一个类似 bosens-China/blog 这样的值 |
| AUTHORIZATION     |    否    |             github 的 token，作用是拉取仓库详情的时候避免并发限制 |
