// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import fs from 'fs';
import {main, validateXLSx, getXLSxData, generateTranslations, render, } from './translationEngine';
const {dialog} = require('electron').remote;
//const ipc = require('electron').ipcRenderer

let state = {};
// document.getElementById('btn-read-file').addEventListener('click', () => {
//   dialog.showOpenDialog((fileNames) => {
//     if(fileNames === undefined){
//       return;
//     } else {
//       let d = fs.readFileSync(fileNames[0],"utf8");
//       console.log(d);
//     }
//   });
// }, false);

document.getElementById('btn-read-dir').addEventListener('change', (evt) => {
    const target = evt.target.files[0].path;
    state.projectFolder = target;
    const dir = fs.readdirSync(evt.target.files[0].path);
    displayFolderTree(dir);
}, false);

function attachLateEvent(){
  document.getElementById('initiateRender').addEventListener('click', (evt) => {
    const dir = fs.readdirSync(`${state.projectFolder}/translation_source`);
    const currentDir = `${state.projectFolder}/translation_source/`;
    dir.map( e => {
      if(validateXLSx(`${currentDir}${e}`)){
        console.log(getXLSxData(`${currentDir}${e}`));
      }
    })
  }, false);
}

function displayFolderTree(dir) {
    const tree = document.getElementById('folderTree');
    tree.innerHTML = "";
    dir.map( (e) => {
      tree.innerHTML += `<li class="tree-item">${e}</li>`;
    });
    if(checkfolderStruct(dir)){
      tree.innerHTML += `<p>do you want to render the templates?</p>`;
      tree.innerHTML += `<button id="initiateRender" class="butt">OK</button>`;
      attachLateEvent();
    } else {
      tree.innerHTML += `<br/><span class="card red">oops, I can't find translation sources or templates in this folder</span>`;
    }
}

function checkfolderStruct(dir) {
    let hasTemplates, hasSource = false;
    dir.map( (e) => {
      if(!hasTemplates)
        hasTemplates = e === 'templates';
      if(!hasSource)
        hasSource = e === 'translation_source';
    });
    return (hasSource && hasTemplates);
}
