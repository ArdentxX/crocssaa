import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/Home.css';

const Home = () => {
    const nav = useNavigate();

    const registerfunc = () => {
        nav('/register');
    };

    const loginfunc = () => {
        nav('/login');
    };

    return (
        <div className="Home-container">
            <h1>Big Dick in Your Town</h1>
            <button onClick={registerfunc}>Register</button>
            <button onClick={loginfunc}>Login</button>
        </div>
    );
};

export default Home;
