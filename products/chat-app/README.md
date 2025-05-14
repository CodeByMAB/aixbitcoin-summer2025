# Chat App (AIxBitcoin Summer 2025)

> Encrypted, sovereign, Nostr-based messaging with Bitcoin tipping.

![AIxBitcoin Chat App Screenshot](./assets/aixbitcoin-chat-app.png)

- Frontend: React + TailwindCSS
- Backend: Flask + Nostr relays
- Features: E2E chat, markdown logs, tipping with BTCPay and Nostr zaps

## Features

- **Nostr Authentication**: Connect with your sovereign identity using NIP-07 extensions
- **Offline Support**: Use the app even when offline, with automatic message syncing when you reconnect
- **Message Signing**: Sign your messages with your Nostr keys for cryptographic proof of identity
- **Symbolic Logic Visualization**: Visualize AI agent consensus mechanisms
- **Real-time Updates**: WebSocket-based messaging with polling fallback

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (3.8+)
- A Nostr extension (Alby, nos2x, etc.) for authentication

### Installation

Clone the repository and install dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Running the Application

From the root directory, you can run:

```bash
# Start both frontend and backend
npm start

# Or run them separately
npm run start:frontend
npm run start:backend
```

- Frontend will be available at: http://localhost:8080
- Backend API will be available at: http://localhost:5001

## Development

### Testing

The application includes comprehensive tests for both frontend and backend:

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

### Building for Production

To create a production build:

```bash
npm run build
```

## Architecture

### Frontend

- React for UI components
- TailwindCSS for styling
- Nostr authentication via NIP-07
- LocalForage for offline data storage
- WebSockets for real-time communication

### Backend

- Flask RESTful API
- Nostr relay implementation (stub)
- Message storage and retrieval
- Signature verification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request