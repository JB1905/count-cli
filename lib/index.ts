#!/usr/bin/env node

import path from 'path';
import program from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import rra from 'recursive-readdir-async';
import ora from 'ora';

import { collect } from './helpers/collect';
import { isHidden } from './helpers/isHidden';

import { Params } from './interfaces/Params';

const spinner = ora();

const pkg = require(path.join(__dirname, '../package.json'));

program
  .version(pkg.version)
  .description(pkg.description)
  .usage('[options]')
  .option(
    '-r, --recursive [depth]',
    'output result including files from sub-directories'
  )
  .option(
    '-x, --exclude [dirs ...]',
    'output result without given files & directories',
    collect,
    []
  )
  .option(
    '-i, --include [dirs ...]',
    'output result for given files & directories',
    collect,
    []
  )
  .action(async ({ recursive = false, exclude, include }: Params) => {
    spinner.start('Checking directories');

    const files = await rra.list('.', {
      ignoreFolders: false,
      recursive,
      exclude,
      include,
    });

    spinner.stop();

    const hiddenFiles: string[] = [];
    const visibleFiles: string[] = [];

    const visibleDirs: string[] = [];
    const hiddenDirs: string[] = [];

    files.map((file: any) => {
      if (file.isDirectory) {
        if (isHidden(file.fullname)) {
          hiddenDirs.push(file);
        } else {
          visibleDirs.push(file);
        }
      } else {
        if (isHidden(file.fullname)) {
          hiddenFiles.push(file);
        } else {
          visibleFiles.push(file);
        }
      }
    });

    const allFiles = visibleFiles.length + hiddenFiles.length;
    const allDirs = visibleDirs.length + hiddenDirs.length;

    console.log(
      chalk.cyanBright(
        `Visible Files: ${visibleFiles.length}\n` +
          `Hidden Files: ${hiddenFiles.length}\n` +
          `All Files: ${allFiles}`
      )
    );

    console.log('');

    console.log(
      chalk.greenBright(
        `Visible Directories: ${visibleDirs.length}\n` +
          `Hidden Directories: ${hiddenDirs.length}\n` +
          `All Directories: ${allDirs}`
      )
    );

    console.log('');

    console.log(
      chalk.yellowBright(
        `All Visible: ${visibleFiles.length + visibleDirs.length}\n` +
          `All Hidden: ${hiddenFiles.length + hiddenDirs.length}\n` +
          `All: ${allFiles + allDirs}`
      )
    );
  });

program.on('--help', () => {
  console.log(
    chalk.red(figlet.textSync('Count CLI', { horizontalLayout: 'full' }))
  );
});

program.parse(process.argv);
