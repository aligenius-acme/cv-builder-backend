import emailQueue, { sendEmailAsync, sendWelcomeEmail, sendPasswordResetEmail } from './emailQueue';
import documentQueue, { processDocumentAsync } from './documentQueue';
import aiQueue, { processAIAsync, AIJobType } from './aiQueue';

// Export all queues
export const queues = {
  email: emailQueue,
  document: documentQueue,
  ai: aiQueue,
};

// Export helper functions
export {
  // Email
  sendEmailAsync,
  sendWelcomeEmail,
  sendPasswordResetEmail,

  // Document
  processDocumentAsync,

  // AI
  processAIAsync,
  AIJobType,
};

// Get queue statistics
export const getQueueStats = async () => {
  const stats = {
    email: {
      waiting: await emailQueue.getWaitingCount(),
      active: await emailQueue.getActiveCount(),
      completed: await emailQueue.getCompletedCount(),
      failed: await emailQueue.getFailedCount(),
      delayed: await emailQueue.getDelayedCount(),
    },
    document: {
      waiting: await documentQueue.getWaitingCount(),
      active: await documentQueue.getActiveCount(),
      completed: await documentQueue.getCompletedCount(),
      failed: await documentQueue.getFailedCount(),
      delayed: await documentQueue.getDelayedCount(),
    },
    ai: {
      waiting: await aiQueue.getWaitingCount(),
      active: await aiQueue.getActiveCount(),
      completed: await aiQueue.getCompletedCount(),
      failed: await aiQueue.getFailedCount(),
      delayed: await aiQueue.getDelayedCount(),
    },
  };

  return stats;
};

// Clean completed and failed jobs from all queues
export const cleanAllQueues = async (grace: number = 3600000) => {
  // grace period in milliseconds (default 1 hour)
  await emailQueue.clean(grace, 'completed');
  await emailQueue.clean(grace, 'failed');

  await documentQueue.clean(grace, 'completed');
  await documentQueue.clean(grace, 'failed');

  await aiQueue.clean(grace, 'completed');
  await aiQueue.clean(grace, 'failed');

  console.log('All queues cleaned');
};

// Pause all queues
export const pauseAllQueues = async () => {
  await emailQueue.pause();
  await documentQueue.pause();
  await aiQueue.pause();
  console.log('All queues paused');
};

// Resume all queues
export const resumeAllQueues = async () => {
  await emailQueue.resume();
  await documentQueue.resume();
  await aiQueue.resume();
  console.log('All queues resumed');
};

// Close all queues gracefully
export const closeAllQueues = async () => {
  await emailQueue.close();
  await documentQueue.close();
  await aiQueue.close();
  console.log('All queues closed');
};

export default queues;
