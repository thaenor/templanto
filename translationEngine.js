const mustache = require('mustache');
const fs = require('fs');
const XLSX = require('xlsx');
const log = console.log;

function validateXLSx(file) {
  try {
    const workbook = XLSX.readFile(file);
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const oo = XLSX.utils.sheet_to_json(worksheet);
        let output = {};
        oo.forEach(e => { output[e.key] = e.value; });
        console.dir(output);
    }
  } catch (e) {
    alert(`oops, I can't read this spreadsheet, are you sure it has valid translations`);
    return false;
  }
  return true;
}

function createFolderIfExists(location, name) {
    if (!fs.existsSync(`${location}/${name}`)) {
        // log(`folder does not exist. generating ${location}/${name}`);
        fs.mkdirSync(`${location}/${name}`);
    }
}

function main() {
    const translation_xls = fs.readdirSync('./translation_source');
    for (let i = 0; i < translation_xls.length; i++) {
        if (translation_xls[i] === '.gitignore' || translation_xls[i] === '.DS_Store') { continue; } //ignoring .gitignore heheh
        try {
            generateTranslations(translation_xls[i]);
        } catch (e) {
            throw console.error(`an error occured in file ${translation_xls[i]} - maybe a sheet is poorly formated`, e);
        }
    }
    render();
}

function generateTranslations(input_file) {
    const workbook = XLSX.readFile(`./translation_source/${input_file}`);
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];

        log(`reading sheet #${i} - ${workbook.SheetNames[i]}`);
        const worksheet = workbook.Sheets[sheetName];
        const oo = XLSX.utils.sheet_to_json(worksheet);
        let output = {};
        oo.forEach(e => { output[e.key] = e.value; });
        const folderName = input_file.split('.')[0];
        createFolderIfExists('./templates', folderName);
        createFolderIfExists(`./templates/${folderName}`, 'translations');
        fs.writeFileSync(`./templates/${folderName}/translations/${sheetName}.json`, JSON.stringify(output), 'utf8');
    }
}

function render() {
    log('looking for templates folder - named "templates".');
    const templates = fs.readdirSync('./templates');
    let fileNames = [];
    let output = [];

    for (let i = 0; i < templates.length; i++) {
        if (templates[i] === '.gitignore' || templates[i] === '.DS_Store') { continue; } //ignoring .gitignore heheh
        log(`reading template file - ./templates/${templates[i]}/${templates[i]}.mustache`);
        const template = fs.readFileSync(`./templates/${templates[i]}/${templates[i]}.mustache`, 'utf8');

        log(`reading folder - ./templates/${templates[i]}/translations`);
        const translations = fs.readdirSync(`./templates/${templates[i]}/translations`);

        log('looking for translations for this template...');

        for (let j = 0; j < translations.length; j++) {
            fileNames.push(`${templates[i].split('.')[0]}_${translations[j].split('.')[0]}`);
            const translationObj = JSON.parse(fs.readFileSync(`./templates/${templates[i]}/translations/${translations[j]}`, 'utf8'));

            output = mustache.render(template, translationObj);

            createFolderIfExists('./', 'render');
            createFolderIfExists('./render/', templates[i]);

            log(`writting to ./render/${templates[i]}/${fileNames[j]}.html`);
            fs.writeFileSync(`./render/${templates[i]}/${fileNames[j]}.html`, output, 'utf8');
            log('wrote file ', `./render/${templates[i]}/${fileNames[j]}.html`);
        }
        fileNames = [];
    }

    log('translation engine finished');
}
