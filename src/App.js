import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

function App() {

  useEffect(() => {
    axios.get('/auth').then(res => {
      console.log(res);
    })
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
      <Button href="http://localhost:3001/auth">Authenticate</Button>
      </header>
    </div>
  );
}

export default App;
