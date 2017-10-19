// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import fs from 'fs';
import {ipcRenderer, remote, dialog} from 'electron';

let state = {};

setTimeout(function () {
  ipcRenderer.send('init-render', `/Users/francisco.santos/Documents/work/translator-tool/translation_engine/translation_source`);
}, 2000);

document.getElementById('btn-read-dir').addEventListener('change', (evt) => {
    const target = evt.target.files[0].path;
    state.projectFolder = target;
    const dir = fs.readdirSync(evt.target.files[0].path);
    displayFolderTree(dir);
}, false);

function attachLateEvent(){
  document.getElementById('initiateRender').addEventListener('click', (evt) => {
    ipcRenderer.send('init-render', `${state.projectFolder}/translation_source`);
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

// Listen for async-reply message from main process
ipcRenderer.on('file-read-ok', (event, file, fData) => {
  document.getElementById('comm').innerHTML += `<strong>file ${file} read sucessfully</strong><hr/>`;
  document.getElementById('notification-area').classList.remove('ninja');
  //TODO: spawn a new window (?) and show cool data
  //TODO: aditionally find some helper packages to display this or whatever, I'm tired!
  //TODO: make a clear notification button
});

ipcRenderer.on('file-read-bad', (event, arg) => {
  document.getElementById('comm').innerHTML += `<strong>file ${arg} read seems to have a problem</strong><hr/>`;
  document.getElementById('notification-area').classList.remove('ninja');
});

// in case I want that validate file feature
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
