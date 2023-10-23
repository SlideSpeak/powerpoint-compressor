import path from 'path';
import fsp from 'fs/promises';
import sharp from 'sharp';
import pngjs from 'pngjs';
import url from 'url';
import fs from 'fs';
import { program } from 'commander';
import { compareFileSizes, logSeparator } from './helpers.js';

const currentDirectoryPath = url.fileURLToPath(new URL('.', import.meta.url));
const videoExtension = 'mp4';

const pngHasTransparency = async (filePath) => {
  const buffer = await fsp.readFile(filePath);
  if (buffer[25] !== 6) {
    return false;
  }
  const parsed = await new Promise((resolve, reject) => {
    new pngjs.PNG().parse(buffer, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
  const imageData = parsed.data;
  const imageDataLength = imageData.length;
  for (let j = 0; j < imageDataLength; j += 4) {
    const alphaBit = parsed.data[j + 3];
    if (alphaBit !== 255) {
      return true;
    }
  }
  return false;
};

const getDestinationExtension = async (extension, filePath) => {
  switch (extension) {
    case 'png': {
      const hasTransparency = await pngHasTransparency(filePath);
      return hasTransparency ? 'png' : 'jpg';
    }
    case 'svg':
      return null;
    case 'asf':
    case 'avi':
    case 'mp4':
    case 'm4v':
    case 'mov':
    case 'mpg':
    case 'mpeg':
    case 'wmv':
      return videoExtension;
    default:
      return 'jpg';
  }
};

const optimizeMedia = async (filePath, logFn) => {
  const extension = path.extname(filePath).replace('.', '').toLowerCase();

  const destinationExtension = await getDestinationExtension(extension, filePath);
  if (!destinationExtension) {
    logFn(`skip because of unhandled extension "${extension}"`);
    return;
  }

  const newFilePath = filePath.replace(new RegExp(`\\.${extension}$`), `.copy.${destinationExtension}`);
  if (destinationExtension === videoExtension) {
    if (!program.opts().removeVideos) {
      logFn('skip because video removal is not enabled');
      return;
    }
    const placeholderVideoFilePath = path.join(currentDirectoryPath, '..', 'assets', 'placeholder-video.mp4');
    await fsp.copyFile(placeholderVideoFilePath, newFilePath);
  } else {
    await sharp(filePath)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(newFilePath);
  }
  logFn(`convert ${filePath} to ${newFilePath}`);

  const newIsSmaller = compareFileSizes(filePath, newFilePath, logFn);
  if (newIsSmaller) {
    await fsp.rename(newFilePath, filePath);
  } else {
    logFn('skip because converted file is bigger');
    await fsp.rm(newFilePath);
  }
};

export const optimizeMedias = async (unzipDirPath) => {
  logSeparator();
  console.log('optimizing medias');
  const mediasDirPath = path.join(unzipDirPath, 'ppt', 'media');
  if (!fs.existsSync(mediasDirPath)) {
    console.log('skip because there is no medias directory');
    return;
  }
  const medias = await fsp.readdir(mediasDirPath);
  await Promise.all(
    medias.map(async (mediaName) => {
      const mediaPath = path.join(mediasDirPath, mediaName);
      const logMessages = [];
      const logFn = (message) => logMessages.push(message);
      try {
        await optimizeMedia(mediaPath, logFn);
      } catch (error) {
        logFn(`failed with error: ${error}`);
      }
      if (logMessages.length) {
        logSeparator();
        console.log(`optimize media: ${mediaPath}`);
        logMessages.forEach((message) => console.log(message));
      }
    }),
  );
};
