import fs from 'fs';
import tmp from 'tmp';
import { program } from 'commander';
import { optimize } from './optimize.js';
import { compareFileSizes, execAsync, logSeparator } from './helpers.js';
import { unzip, zip } from './zip.js';

const run = async () => {
  tmp.setGracefulCleanup();

  const [inputFilePath, outputFilePath] = program.args;
  const unzipDirPath = tmp.dirSync().name;

  console.log('start processing');
  await unzip(inputFilePath, unzipDirPath);
  await optimize(unzipDirPath);
  await zip(unzipDirPath, outputFilePath);

  logSeparator();
  console.log('end processing');
  compareFileSizes(inputFilePath, outputFilePath, console.log);

  if (program.opts().debug) {
    logSeparator();
    console.log('opening generated file');
    const debugFilePath = outputFilePath.replace('.pptx', `.debug-${Date.now()}.pptx`);
    fs.copyFileSync(outputFilePath, debugFilePath);
    await execAsync(`npx open-cli ${debugFilePath}`);
  }
};

program
  .name('pptx-optimizer')
  .description('A tool that optimize PowerPoint file size.')
  .argument('<input-file>', 'the file to optimize path')
  .argument('<output-file>', 'the output file path')
  .option('--remove-videos', 'removes all the videos')
  .option('--debug', 'opens the output file after processing')
  .action(run)
  .parse();
