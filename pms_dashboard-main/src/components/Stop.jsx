import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { ref, update ,set} from 'firebase/database';

const Stop = () => {

  const { numberplate } = useParams();
  const [number,setNumber] = useState(null);
  // const [uuid, setUuid] = useState(null);
  const [stopwatchData, setStopwatchData] = useState([]);
  // console.log(numberplate);

  useEffect(() => {
    // const uuidFromLocalStorage = localStorage.getItem('uuid');
    if ( numberplate) {
      setNumber( numberplate);
    }

  }, [ numberplate]);

  const startStopwatch = () => {
    const startTime = Date.now();
    const newData = [...stopwatchData, { startTime }];
    setStopwatchData(newData);
  };

  const stopStopwatch = async () => {
    const currentTime = Date.now();
    const updatedData = stopwatchData.map((data) => {
      if (!data.endTime) {
        const endTime = new Date(currentTime).toLocaleString();
      const startTime = new Date(data.startTime).toLocaleString();
      const timeInterval = currentTime - data.startTime;
      return { ...data, endTime, startTime, interval:formatTime(timeInterval)};
      }
      return data;
    });
  
    setStopwatchData(updatedData);
  
    try {
      await update(ref(db, `${number}`), { time: updatedData }); // Update time data inside vehicle object
    } catch (error) {
      console.error("Error updating database:", error);
    }
  };
  
  const resetStopwatch = () => {
    setStopwatchData([]);
  };

  // Helper function to convert milliseconds to hours and minutes
  const formatTime = (time) => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  return (
    <div>
      <h2>Stopwatch</h2>
      <button onClick={startStopwatch}>Start</button>
      <button onClick={stopStopwatch}>Stop</button>
      <button onClick={resetStopwatch}>Reset</button>
      <div>
        {stopwatchData.map((data, index) => (
          <div key={index}>
            <p>Start Time: {data.startTime ? new Date(data.startTime).toLocaleString() : ''}</p>
            <p>End Time: {data.endTime ? new Date(data.endTime).toLocaleString() : ''}</p>
            <p>Interval: {data.interval ? formatTime(data.interval) : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stop;
