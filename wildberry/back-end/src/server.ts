import Logger from './utils/Logger';
import { port } from './config';
import app from './app';

app
  .listen(port, () => {
    console.log(`server running on port : ${port}`);
    Logger.info(`server running on port : ${port}`);
  })
  .on('error', (e: unknown) => Logger.error(e));
