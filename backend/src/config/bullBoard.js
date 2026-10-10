import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { jobQueue } from '../queues/jobQueue.js';

export const setupBullBoard = (app) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(jobQueue)],
    serverAdapter: serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());
};
