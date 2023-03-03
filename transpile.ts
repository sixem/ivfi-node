import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

import {
    execSync
} from 'child_process';

/** Clean, compile and transpile project */
['clean', 'compile:production', 'transpile:tsc'].forEach((command) =>
{
    execSync(`npm run ${command}`, {
        stdio: 'inherit',
        cwd: __dirname
    });
});

/** Compiled directory */
const compileDirectory = path.join(__dirname, 'packed');

/** Prepare required package directories */
['views', 'dist'].forEach((directory) =>
{
    fs.copySync(path.join(__dirname, directory), path.join(compileDirectory, directory));
});

/** Prepare required package files */
['package.json', '.npmignore', 'README.md', 'logo.svg', 'LICENSE'].forEach((file) =>
{
    fs.copySync(path.join(__dirname, file), path.join(compileDirectory, file));
});

/** Pack source */
execSync(`npm pack`, {
    stdio: 'inherit',
    cwd: compileDirectory
});

console.log(chalk.yellow(`\n\nAttempted to create pack in: ${compileDirectory}\n\nExiting.`));