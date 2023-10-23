import fs from 'fs';
import cp from 'child_process';
import { promisify } from 'util';

const round = (value, decimals) => Number(Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`).toFixed(decimals));

const sizeFormatter = new Intl.NumberFormat([], {
  style: 'unit',
  unit: 'byte',
  notation: 'compact',
  unitDisplay: 'narrow',
});

export const compareFileSizes = (aFilePath, bFilePath, logFn) => {
  const aSize = fs.statSync(aFilePath)?.size;
  const bSize = fs.statSync(bFilePath)?.size;
  if (!aSize || !bSize) {
    return false;
  }
  const difference = aSize - bSize;
  const differenceRatio = difference / aSize;
  const [formattedASize, formattedBSize, formattedDifference] = [aSize, bSize, difference].map(
    (size) => sizeFormatter.format(size).replace(' o', 'o'),
  );
  const differencePercentage = round(differenceRatio * 100, 1);

  logFn('size comparison');
  logFn(`before     : ${formattedASize}`);
  logFn(`after      : ${formattedBSize}`);
  logFn(`difference : ${formattedDifference} (${differencePercentage} %)`);

  return difference > 0;
};

export const execAsync = promisify(cp.exec);

export const logSeparator = () => {
  console.log('-'.repeat(20));
};
