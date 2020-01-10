#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
npm run dev
git add .
git commit -m 'type: deploy'

git push -f git@github.com:bosens-China/blog.git master