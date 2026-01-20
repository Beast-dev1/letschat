export default function ChatPage({ params }: { params: { chatId: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <p className="text-gray-600">Chat ID: {params.chatId}</p>
        <p className="text-gray-600">Chat page - Coming soon</p>
      </div>
    </div>
  );
}

