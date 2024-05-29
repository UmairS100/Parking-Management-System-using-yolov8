import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../css/Login.css';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const navigate = useNavigate();
  
  const [details,setDeatails] = useState({
    email:"",
    password:"",
  })

  var email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  var pass_regex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,19}$/;

  const [pass_sym,setPass_sym] = useState('password');
  const [click,setClick] = useState(false);
  

  const handleChange = (e) => {
    const {name,value} = e.target;
    setDeatails((prev)=>{
      return{...prev,[name]:value}
    })
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if(email_regex.test(details.email) && pass_regex.test(details.password)){
    // console.log(details);
    signInWithEmailAndPassword(auth,details.email,details.password)
    .then((userCredentials)=>{
    navigate('/dashboard');
      // navigate(`/home/${vehicle}`);
    }).catch((error)=>{
        alert(error);
    })
  };
}

  const passIconCick = () => {
    if(pass_sym==='password'){
      setPass_sym('text');
      setClick(true);
    }else{
      setPass_sym('password');
      setClick(false);
    }
  }

  return (
    <div className='login-main'>
        <div className="login-container">
      <h2 className='form-head'>Login</h2>
      <form>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            type="email"
            name="email"
            required
            value={details.email}
            onChange={handleChange}
            className="login-input"
          />
        </div>
        <span className='span-error'>
            {
            (details.email.length)===0?"":
            (email_regex.test(details.email))?"":"Match Email Pattern"
            }
          </span>
          <div className='password-wrapper'>
          <label htmlFor='password'>Password</label>
          <input
            type={pass_sym}
            name="password"
            required
            value={details.password}
            onChange={handleChange}
            className="login-input"
          />
          <span className='pass-span' onClick={passIconCick}>
            {
              (click)?<VisibilityIcon/>:<VisibilityOffIcon/>
            }
            </span>
        </div>
        <span className='span-error'>
            {
            (details.password.length)===0?"":
            (pass_regex.test(details.password))?"":"Match Password Pattern"
            }
          </span>
        <button type="submit" onClick={handleLogin} className="login-button">
          Login
        </button>
      </form>
    </div>
    </div>
    
  );
};
export default Login;
