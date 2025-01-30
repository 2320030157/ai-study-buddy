import { EventEmitter } from 'events';

// Increase the default limit for event listeners
EventEmitter.defaultMaxListeners = 15;

// Handle process events
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 