import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/login.css'

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const nav = useNavigate();
    const [message, setMessage] = useState('');

    const handleLogin =  async(e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:5000/api/login" , {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({username,password})
        });

        if(response.ok){
            localStorage.setItem('username' , username)
            nav(`/homepage/${username}`)
        }else{
            const data = await response.json();
            setMessage(data.message || 'Failed to log in pleas try again')
        }
    }


    return(
        <div className="login-container">
            <h1 className="login-title">Login</h1>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="input-group">
                    <label className='label1'>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label className='label2'>Password:</label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button type="Submit" className="login-button">Log in</button>
            </form>
            {message && <p className="error-message" style={{ color: 'red' }}>{message}</p>}
        </div>
    )


}

export default Login;