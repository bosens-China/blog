#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
git init
npm run dev
git add -A
git commit -m 'type: deploy'

git push -f git@github.com:bosens-China/blog.git master
cd -