import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase'; // Import your Firebase configuration and authentication module
import { useNavigate } from "react-router-dom";

import {getAuth } from 'firebase/auth'; // Import your Firebase configuration and authentication module
import SlotsTable from './SlotsTable'; // Import the SlotsTable component

const AddSeat = () => {
  const navigate = useNavigate();
  const [numSlots, setNumSlots] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        navigate('/*');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authenticated) {
      // Handle unauthenticated access
      console.error("User not authenticated. Access denied.");
      return;
    }

    // Convert numSlots to a number
    const count = parseInt(numSlots);
    if (count > 0) {
      // Loop through the number of slots and push each slot to the database
      for (let i = 1; i <= count; i++) {
        const slotName = `slot${i}`; // Dynamically generate slot name
        const newSlotRef = ref(db, `parking_slots/${slotName}`);
        const slotData = {
          slot_number: i,
          status: 'available'
        };
        set(newSlotRef, slotData)
          .then(() => {
            console.log(`Slot ${i} added successfully`);
          })
          .catch((error) => {
            console.error('Error adding slot:', error);
          });
      }
    }
  };

  return (
    <div>
      {authenticated ? (
        <>
          <h2>Add Parking Slots</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Number of Slots:
              <input
                type="number"
                value={numSlots}
                onChange={(e) => setNumSlots(e.target.value)}
                required
              />
            </label>
            <button type="submit">Add Slots</button>
          </form>
          {/* Include the SlotsTable component */}
          <SlotsTable />
        </>
      ) : ""}
    </div>
  );
};

export default AddSeat;
