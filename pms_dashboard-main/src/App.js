import "./App.css";
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Stop from "./components/Stop";
import Parking_slot from "./components/Parking_slot";
import AddSeat from "./components/AddSeat";

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route exact path='/' element={< Login />}></Route> 
    <Route exact path='/login' element={< Login />}></Route> 
    <Route exact path='/addSeat' element={<AddSeat/>}></Route> 
    <Route path='/home/:numberplate' element={< Stop />}></Route>
    <Route exact path='/signup' element={< Signup/>}></Route>
    <Route exact path='/slot' element={< Parking_slot/>}></Route>
    <Route exact path='/dashboard' element={< Dashboard/>}></Route>
    <Route exact path='/*' element={< Signup />}></Route> 
    </Routes>
  </BrowserRouter>
  );
}

export default App;
