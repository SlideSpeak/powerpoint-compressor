import path from 'path';
import fsp from 'fs/promises';
import fs from 'fs';
import JSZip from 'jszip';
import { execAsync, logSeparator } from './helpers.js';

const getFilePathsRecursively = async (dir) => {
  const list = await fsp.readdir(dir);
  const statPromises = list.map(async (file) => {
    const fullPath = path.resolve(dir, file);
    const stat = await fsp.stat(fullPath);
    if (stat && stat.isDirectory()) {
      return getFilePathsRecursively(fullPath);
    }
    return fullPath;
  });
  return (await Promise.all(statPromises)).flat(Infinity);
};

const createZipFromFolder = async (dir) => {
  const absRoot = path.resolve(dir);
  const filePaths = await getFilePathsRecursively(dir);
  return filePaths.reduce((z, filePath) => {
    const relative = filePath.replace(absRoot, '');
    const zipFolder = path
      .dirname(relative)
      .split(path.sep)
      .reduce((zf, dirName) => zf.folder(dirName), z);
    zipFolder.file(path.basename(filePath), fs.createReadStream(filePath));
    return z;
  }, new JSZip());
};

// Source: https://github.com/Stuk/jszip/issues/386
// eslint-disable-next-line no-async-promise-executor
export const zip = async (dirPath, outputFilePath) => new Promise(async (resolve, reject) => {
  logSeparator();
  console.log('zipping new file');
  const start = Date.now();
  try {
    (await createZipFromFolder(dirPath))
      .generateNodeStream({ streamFiles: true, compression: 'DEFLATE' })
      .pipe(fs.createWriteStream(outputFilePath))
      .on('error', (err) => {
        console.error('error writing file', err.stack);
        reject(err);
      })
      .on('finish', () => {
        console.log('zip written successfully:', Date.now() - start, 'ms');
        resolve();
      });
  } catch (ex) {
    console.error('error creating zip', ex);
  }
});

export const unzip = (filePath, outputDirPath) => {
  logSeparator();
  console.log('unzipping file');
  return execAsync(`unzip -qq -o "${filePath}" -d "${outputDirPath}"`);
};
