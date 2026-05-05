import chalk from 'chalk';

const getTime = () => new Date().toISOString();

export const logger = {
  info: (msg) => console.log(chalk.blue(`[INFO ${getTime()}] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS ${getTime()}] ${msg}`)),
  warn: (msg) => console.warn(chalk.yellow(`[WARN ${getTime()}] ${msg}`)),
  error: (msg) => console.error(chalk.red(`[ERROR ${getTime()}] ${msg}`)),
};
