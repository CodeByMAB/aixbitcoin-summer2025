import React from 'react';
import { ChatWindow } from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import { MessageProvider } from './context/MessageContext';
import { AuthProvider } from './context/AuthContext';
import AuthStatus from './components/AuthStatus';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MessageProvider>
        <div className="min-h-screen bg-background font-sans text-text">
          {/* Paper texture overlay (positioned first, lower z-index) */}
          <div 
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/assets/paper-texture.png')",
              opacity: 0.4,
              mixBlendMode: 'multiply'
            }}
          />
          
          {/* Background sigil (positioned above paper texture) */}
          <div
            className="fixed inset-0 bg-center bg-no-repeat pointer-events-none z-10"
            style={{ 
              backgroundImage: "url('/assets/the_seeking_blade_gold.png')",
              backgroundSize: '60%',
              opacity: 0.15,
              mixBlendMode: 'color-burn'
            }}
          />

          {/* Main content */}
          <div className="relative min-h-screen flex flex-col z-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
              <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="font-serif text-2xl text-accent">AIxBitcoin Chat</h1>
                <AuthStatus />
              </div>
            </header>

            {/* Chat area */}
            <main className="flex-1 flex flex-col overflow-hidden pb-16">
              <div className="flex-1 overflow-hidden">
                <ChatWindow />
              </div>
            </main>
            
            {/* Message input floats above the content */}
            <MessageInput />

            {/* Connection status banner - shows when offline */}
            <div 
              id="offline-status" 
              className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center transform transition-transform duration-300 translate-y-full z-50"
            >
              You are currently offline. Messages will be sent when you reconnect.
            </div>

            {/* TODO: Add BTCPay tip jar and Nostr zap integration */}
          </div>
        </div>
      </MessageProvider>
    </AuthProvider>
  );
};

export default App;