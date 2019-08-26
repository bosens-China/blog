const fs = require('fs');
const path = require('path');
// 读取文件
const getFile = function getFile (path, option = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, option, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}
// 写入文件
const setFile = function setFile (path, text, option = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, text, option, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve(text);
    });
  });
}
// 移动文件
const moveFile = function setFileName (path, target) {
  return new Promise((resolve, reject) => {
    fs.rename(path, target, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
  });
}

const getStat = function getStat(path){
  return new Promise((resolve) => {
      fs.stat(path, (err, stats) => {
          if(err){
              resolve(false);
          }else{
              resolve(stats);
          }
      })
  })
}

const mkdir =  function mkdir(dir){
  return new Promise((resolve) => {
      fs.mkdir(dir, err => {
          if(err){
              resolve(false);
          }else{
              resolve(true);
          }
      })
  })
}
// 目录是否存在
const dirExists = async function dirExists(dir){
  let isExists = await getStat(dir);
  //如果该路径且不是文件，返回true
  if(isExists && isExists.isDirectory()){
      return true;
  }else if(isExists){    
     //如果该路径存在但是文件，返回false
      return false;
  }
  //如果该路径不存在
  let tempDir = path.parse(dir).dir;     
   //拿到上级路径
  //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(tempDir);
  let mkdirStatus;
  if(status){
      mkdirStatus = await mkdir(dir);
  }
  return mkdirStatus;
}
module.exports = {getFile, setFile, moveFile, dirExists};