const Issues = require('./Issues');
const config = require('./config');
const path = require('path');
const { moveFile, getFile, setFile, dirExists } = require('./tool');
const issues = new Issues(config.blogUrl);
(async () => {
  const { text } = await issues.getContent();
  issues.content.push(text);
  const page = issues.getPage(text);
  const value = await issues.getAllContent({
    page,
    current: 2,
  });
  issues.content.push(...value.map(f => f.text));
  // 所有数组添加到一起
  const fileDescription = issues.getDetails(issues.content);
  const fileContent = issues.generate(fileDescription);
  const target = path.resolve(__dirname, '../README.md');
  // 读取
  let content = await getFile(path.resolve(__dirname, './template.md'));
  content = content.replace(/#\sreplace/, fileContent);
  // 备份一下文件
  const date = new Date();
  const name = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.md`;
  // 目录不存在就创建
  await dirExists(path.resolve(__dirname, '../backups'));
  await moveFile(target, path.resolve(__dirname, '../backups', name));
  // 写入文件
  await setFile(target, content);
  console.log(`${target}\n${content}`);
})().catch(e => {
  console.log(e);

});




