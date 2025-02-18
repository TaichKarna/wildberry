import Logger from './utils/Logger';
import { port } from './config';
import app from './app';
import { initializeDatabase } from './database/init';

async function startServer() {
  try {
    await initializeDatabase();
    
    app
      .listen(port, () => {
        console.log(`server running on port : ${port}`);
        Logger.info(`server running on port : ${port}`);
      })
      .on('error', (e: unknown) => Logger.error(e));
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
