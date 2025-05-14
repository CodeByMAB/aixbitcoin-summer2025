import { sendMessage } from '../src/nostr';

// Test configuration
const TEST_DURATION = 30000; // 30 seconds
const MESSAGE_INTERVAL = 3000; // 3 seconds
const IS_TEST_MODE = true; // Toggle this to enable/disable test mode

// Simulated users with their pubkeys
const TEST_USERS = [
  { name: 'Alice', pubkey: 'alice123456789' },
  { name: 'Bob', pubkey: 'bob123456789' },
  { name: 'Carol', pubkey: 'carol123456789' },
  { name: 'Dave', pubkey: 'dave123456789' },
];

// Sample messages for each user
const TEST_MESSAGES = [
  'Hello from {name}! 👋',
  'What\'s the current block height?',
  'Anyone seen the latest Bitcoin Core release?',
  'Just bought some sats! 🚀',
  'What do you think about the latest LN developments?',
  'Anyone here from the Bitcoin meetup?',
  'Just set up my first Lightning node!',
  'What\'s your favorite Bitcoin wallet?',
  'Anyone using BTCPay Server?',
  'Just learned about Nostr, this is awesome!',
];

// Helper to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Format message with user name
const formatMessage = (message: string, name: string): string => {
  return message.replace('{name}', name);
};

// Send a test message
const sendTestMessage = async () => {
  const user = getRandomItem(TEST_USERS);
  const messageTemplate = getRandomItem(TEST_MESSAGES);
  const content = formatMessage(messageTemplate, user.name);

  console.log(`[TEST] ${user.name} sending: ${content}`);
  await sendMessage(content);
};

// Main simulation function
const runSimulation = () => {
  if (!IS_TEST_MODE) {
    console.log('Test mode is disabled. Set IS_TEST_MODE to true to run simulation.');
    return;
  }

  console.log('Starting message simulation...');
  console.log(`Will run for ${TEST_DURATION / 1000} seconds`);
  console.log('Press Ctrl+C to stop');

  const interval = setInterval(sendTestMessage, MESSAGE_INTERVAL);

  // Stop simulation after TEST_DURATION
  setTimeout(() => {
    clearInterval(interval);
    console.log('Simulation complete!');
  }, TEST_DURATION);
};

// Run simulation if this file is executed directly
if (require.main === module) {
  runSimulation();
}

// Export for potential use in other files
export { runSimulation, IS_TEST_MODE }; 