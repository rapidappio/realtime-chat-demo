import './App.css';
import {useEffect, useState, useRef} from "react";

function App() {

    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    const socket = useRef(null);

    const [username, setUsername] = useState('');

    const [existingUserName, setExistingUsername] = useState(localStorage.getItem('username') || '');


    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:3005');

        socket.current.onopen = () => {
            console.log('Connected successfully.');
        }

        socket.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages([...messages, JSON.parse(msg['utf8Data'])])
        }

        return () => {
            socket.current.close();
        };
    }, [messages]);

    useEffect(() => {
        fetchMessages();
    }, []);


    const sendMessage = () => {
        if (messageInput.trim() === '') {
            return
        }

        const message = {
            text: messageInput,
            username: existingUserName,
            timestamp: new Date().toISOString(),
        }

        socket.current.send(JSON.stringify(message))
        setMessageInput('')
    }

    const fetchMessages = () => {
        fetch('http://localhost:3005/messages')
            .then((res) => res.json())
            .then((data) => {
                setMessages(data)
            })
    }

    return (
        <div className="App">
            {existingUserName ? (
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                    <div className="message sent">
                        <span className="message-timestamp">{message['username']}</span>
                        <span className="message-content">{message['text']}</span>
                    </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Type your message"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && messageInput.trim() !== '') {
                                sendMessage();
                            }
                        }}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>) : (
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={() => {
                        const u=username.trim()
                        localStorage.setItem('username', u);
                        setExistingUsername(u)
                    }}>Connect</button>
                </div>
            )}
        </div>
    );
}

export default App;
