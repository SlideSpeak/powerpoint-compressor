import path from 'path';
import fsp from 'fs/promises';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { logSeparator } from './helpers.js';

export const optimizeFonts = async (unzipDirPath) => {
  logSeparator();
  console.log('optimizing fonts');
  const fontsDirPath = path.join(unzipDirPath, 'ppt', 'fonts');
  if (!fs.existsSync(fontsDirPath)) {
    console.log('skip because there is no fonts directory');
    return;
  }
  await fsp.rm(fontsDirPath, { force: true, recursive: true });

  const presentationFilePath = path.join(unzipDirPath, 'ppt', 'presentation.xml');
  const content = await fsp.readFile(presentationFilePath);
  const dom = new JSDOM(content, { contentType: 'application/xml' });
  const rootElement = dom.window.document.documentElement;
  const embeddedFontListNode = [...rootElement.children].find((it) => it.tagName === 'p:embeddedFontLst');
  if (!embeddedFontListNode) {
    console.log('could not find embeded font list element to remove');
    return;
  }
  embeddedFontListNode.remove();
  const newContent = rootElement.outerHTML;
  await fsp.writeFile(presentationFilePath, newContent);
};
