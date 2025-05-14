import React from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-orange-500 text-white p-4">
        <h1 className="text-2xl font-bold">AIxBitcoin Chat</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatWindow />
      </main>
      <footer className="p-4 bg-white border-t">
        <MessageInput />
      </footer>
    </div>
  );
};

export default App; 