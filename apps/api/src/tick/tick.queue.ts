import { Queue } from 'bullmq';

export const tickQueue = new Queue('tick-queue', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// TODO: wire Worker + dead-letter queue strategy for production scale.
