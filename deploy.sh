#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
node src/main.js
git init
git config --global user.email "1123598783@qq.com"
git config --global user.name "boses"
git add -A
git commit -m 'type: deploy'

git push -f git@github.com:bosens-China/blog.git master

cd -