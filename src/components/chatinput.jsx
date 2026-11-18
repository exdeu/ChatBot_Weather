import {useState} from 'react'

const ChatInput = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('')
    const handleSend = (event) => {  
    event.preventDefault()     
    const trimmedMessage = message.trim()
        if (!trimmedMessage || disabled){
            return;
        }
        onSendMessage(trimmedMessage)
        setMessage('')

    } ;
    return (
        <form onSubmit={handleSend}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                aria-label="Message"
                disabled={disabled}
            />
            <button type="submit" disabled={disabled || !message.trim()}>Send</button>
        </form>
    );
}


    export default ChatInput;
