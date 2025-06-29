import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/register.css'

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        const response = await fetch('http://127.0.0.1:5000/api/register', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(`Error: ${data.message}`);
        } else {
            setMessage(data.message);
            navigate('/login');

        }
    }

    return (
        <div className="register-container">
            <h1 className="register-title">Register</h1>
            <form className="register-form" onSubmit={handleRegister}>
                <div className="input-group">
                    <label className="label">Username:</label>
                    <input
                        className="input-field"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Password:</label>
                    <input
                        className="input-field"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Confirm Password:</label>
                    <input
                        className="input-field"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Email:</label>
                    <input
                        className="input-field"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button className="register-button" type="submit">Register</button>
            </form>
            {message && <p className="error-message">{message}</p>}
        </div>
    );
};

export default Register;
