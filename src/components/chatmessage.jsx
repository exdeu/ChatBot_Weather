const ChatMessage = ({ message }) => {
    return (
        <div className={`chat-message ${message.role}`}>
            <div className="chat-bubble">{message.content}</div>
        </div>
    );
}

export default ChatMessage;
