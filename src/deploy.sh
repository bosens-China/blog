#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

npm run dev
git add .
git commit -m 'deploy'
git push origin master:master -f
