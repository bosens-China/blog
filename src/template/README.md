# template

渲染模板内容并且输出，使用了 [ejs](https://ejs.bootcss.com/) 作为模板引擎。

注意：因为 ejs 默认会输出换行符等内容，例如

```html
<% data.forEach(item => { %> ## <%= item.title -%> <% item.data.forEach(li => {%> - [<%= li.title %>](<%= li.url %>)<%
}) -%> <% if (item.more) { %> - [查看所有文章](/docs/<%= item.fileName %>)<% } -%> <% }) %>
```

如果上面代码`-%>`不存在的话，就会输出成一行、换行符、一行的规则。
