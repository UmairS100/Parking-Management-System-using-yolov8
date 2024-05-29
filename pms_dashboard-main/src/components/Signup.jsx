import React, { useState } from 'react';
import Stop  from './Stop';
import { uid } from 'uid';
import { useNavigate } from "react-router-dom";
import '../css/Login.css';
import { auth } from '../firebase';
import { db } from '../firebase';
import { set,ref,onValue } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Signup = () => {
  const navigate = useNavigate();

  const [details,setDeatails] = useState({
    name:"",
    vehicle:"",
    email:"",
    password:"",
    c_password:"",
  })

  const [click,setClick] = useState(false);
  const [c_click,c_setClick] = useState(false);

  const [pass_sym,setPass_sym] = useState('password');

  const [c_pass_sym,c_setPass_sym] = useState('password');

  var email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  var pass_regex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,19}$/;

  var vehicle_regex = /^[A-Z]{2}\s?[0-9]{1,2}\s?(?:[A-Z])?(?:[A-Z]*)?\s?[0-9]{4}$/;

  const passIconCick = () => {
    if(pass_sym==='password'){
      setPass_sym('text');
      setClick(true);
    }else{
      setPass_sym('password');
      setClick(false);
    }
  }

  const c_passIconCick = () => {
    if(c_pass_sym==='password'){
      c_setPass_sym('text');
      c_setClick(true);
    }else{
      c_setPass_sym('password');
      c_setClick(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
  if (name === 'vehicle') {
    // Remove spaces from vehicle number
    const vehicleNo = value.replace(/\s/g, ''); // Remove all spaces
    setDeatails((prev) => {
      return { ...prev, [name]: vehicleNo };
    });
  } else {
    setDeatails((prev) => {
      return { ...prev, [name]: value };
    });
  }
  }

  const handleSignIn = (e) => {
    e.preventDefault();
    // const uuid = uid();
    if(details.name.length > 0 && vehicle_regex.test(details.vehicle) && email_regex.test(details.email) && pass_regex.test(details.password) && details.password===details.c_password){
      // const usersRef = ref(db, 'users');
      // onValue(usersRef, (snapshot) => {
      //   const userData = snapshot.val();
      //   console.log(userData);
      // });
      createUserWithEmailAndPassword(auth,details.email,details.password)
      .then((userCredentials)=>{
      const {name,email,vehicle} = details;
        set(ref(db,`/users/${userCredentials.user.uid}`),{
          name,
          vehicle,
          email
        })
        // navigate(`/home/${vehicle}`);
        navigate('/login');
      }).catch((error)=>{
          alert(error);
      })
    }else{
      alert("Fill All Fields");
    }
   
  };

  return (
    <div className='login-main'>
        <div className="login-container">
      <h2 className='form-head'>Sign Up</h2>
      <form>
      <div>
          <label htmlFor='name'>Name</label>
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            value={details.name}
            className="login-input"
          />
        </div>
        <div>
          <label htmlFor='vehicle'>Vehicle No.</label>
          <input
            name="vehicle"
            required
            type="text"
            value={details.vehicle}
            onChange={handleChange}
            className="login-input"
          />
          <span className='span-error'>
            {
            (details.vehicle.length)===0?"":
            (vehicle_regex.test(details.vehicle))?"":"Match Vehicle Pattern"
            }
          </span>
        </div>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            value={details.email}
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
        <div className='password-wrapper'>
          <label htmlFor='c_password'>Confirm Password</label>
          <input
            type={c_pass_sym}
            name="c_password"
            required
            value={details.c_password}
            onChange={handleChange}
            className="login-input"
          />
           <span className='pass-span' onClick={c_passIconCick}>
            {
              (c_click)?<VisibilityIcon/>:<VisibilityOffIcon/>
            }
            </span>
        </div>
        <span className='span-error'>
            {
            ((details.c_password.length)===0)?"":
            (details.password===details.c_password)?"":"Password Not Matched"
            }
          </span>
        <button type="submit" onClick={handleSignIn} className="login-button">
          SignIn
        </button>
      </form>
    </div>
    </div>
  );
};

export default Signup;
