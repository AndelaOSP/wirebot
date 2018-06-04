import glob from 'glob';
import path from 'path';

const specFiles = glob.sync('*.spec.js', {
  cwd: path.resolve(__dirname), matchBase: true, ignore: ['helpers/**']
});

specFiles.map(file => require(`./${file}`));
