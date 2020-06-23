#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
git clone git@github.com:bosens-China/blog.git blog
cd blog
npm run dev
git add -A
git commit -m 'docs(GitHub Actions自动更新)'

git push -f git@github.com:bosens-China/blog.git master
cd -