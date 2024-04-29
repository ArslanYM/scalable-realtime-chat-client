import React, { useCallback, useContext, useEffect, useState } from "react"
import { Socket, io } from 'socket.io-client';
interface SocketProviderProps {
    children?: React.ReactNode
}

interface IsocketContext {
    sendMessage: (msg: string) => any;
    messages: string[]
}

const SocketContext = React.createContext<IsocketContext | null>(null);
// custom hook
export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) throw new Error(`State is undefined`);

    return (state);
}
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>()
    const [messages, setMessages] = useState<string[]>([])
    const sendMessage: IsocketContext['sendMessage'] = useCallback((msg) => {
        console.log("Send Message", msg);
        if (socket) {
            socket.emit('event:message', { message: msg });
        }

    }, [socket]);

    const onMessageRecieved = useCallback((msg: string) => {
        console.log('From Server Message Recieved : ', msg);
        const { message } = JSON.parse(msg) as { message: string };
        setMessages((prev) => [...prev, message]);
    }, [])


    useEffect(() => {
        const _socket = io("http://localhost:8000");
        _socket.on('message', onMessageRecieved)
        setSocket(_socket);
        return () => {
            _socket.disconnect();
            _socket.off('message');
            setSocket(undefined);

        }
    }, [])
    return (

        <SocketContext.Provider value= {{ sendMessage, messages }
}>
    { children }
    < /SocketContext.Provider>

    )
}