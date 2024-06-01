<!-- # @blog/side-effect

副作用相关代码，主要作用有以下几点：

1. 输出仓库问题列表给 @blog/view 使用
2. 输出 README.md 到根目录 -->

# @blog/rear-end

输出拉取的信息给 @blog/app 消费，本来做成接口形式，不过发现并不被支持，因为只有 page.tsx 才能使用 generateStaticParams。

所以分为两块，对于支持的环境继续给定接口来调用，不支持的环境则给定 json 让其使用。

工作原理：

- 在 scripts 注入 preinstall 钩子
- 执行副作用代码，输出文件
- 被其他仓库调用使用
