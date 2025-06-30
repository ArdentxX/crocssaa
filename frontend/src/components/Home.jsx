import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/Home.css';

const Home = () => {
    const nav = useNavigate();
    const [chatVisible, setChatVisible] = useState(false);

    const registerfunc = () => {
        nav('/register');
    };

    const loginfunc = () => {
        nav('/login');
    };

    const toggleChat = () => {
        setChatVisible(prev => !prev);
    };

    return (
        <div className="Home-container">
            <h1>Big Dick in Your Town</h1>
            <button onClick={registerfunc}>Register</button>
            <button onClick={loginfunc}>Login</button>
            <button onClick={toggleChat}>Chat</button>

            <div className={`chat-panel ${chatVisible ? 'visible' : ''}`}>
                <div className="chat-header">Czaty</div>
                <div className="chat-content">
                    {/* Zawartość czatu */}
                </div>
            </div>
        </div>
    );
};

export default Home;
