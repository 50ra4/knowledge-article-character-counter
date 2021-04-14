import { createInterface } from 'readline';

import { log } from 'fp-ts/lib/Console';
import { pipe, flow } from 'fp-ts/lib/function';
import { Task, chain, chainFirst, fromIO } from 'fp-ts/lib/Task';

// read from standard input
const getStrLn: Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

// write to standard output
const putStrLn = flow(log, fromIO);

// ask something and get the answer
function ask(question: string): Task<string> {
  return pipe(
    putStrLn(question),
    chain(() => getStrLn),
  );
}

const main: Task<string> = pipe(
  ask('What is your name?'),
  chainFirst((name) => putStrLn(`${name}, Welcome to TypeScript!`)),
);

main();
