import React from 'react';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      {/* Background watermark */}
      <div
        className="fixed inset-0 bg-sigil bg-center bg-no-repeat opacity-5 pointer-events-none"
        style={{ backgroundSize: '50%' }}
      />
      
      {/* Paper texture overlay */}
      <div className="fixed inset-0 bg-paper-texture opacity-10 pointer-events-none" />

      {/* Main content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="font-serif text-2xl text-accent">AIxBitcoin Chat</h1>
          </div>
        </header>

        {/* Chat area */}
        <main className="flex-1 flex flex-col">
          <ChatWindow />
          <MessageInput />
        </main>

        {/* TODO: Add BTCPay tip jar and Nostr zap integration */}
      </div>
    </div>
  );
};

export default App; 