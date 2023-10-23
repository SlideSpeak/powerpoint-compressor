import { optimizeMedias } from './optimize-medias.js';
import { optimizeFonts } from './optimize-fonts.js';

export const optimize = async (unzipDirPath) => {
  await optimizeMedias(unzipDirPath);
  await optimizeFonts(unzipDirPath);
};
