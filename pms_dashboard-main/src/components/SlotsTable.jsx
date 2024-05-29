import React, { useState, useEffect } from 'react';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '../firebase'; // Import your Firebase configuration

const SlotsTable = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // Fetch slots from the database
    const slotsRef = ref(db, 'parking_slots');
    onValue(slotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const slotsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        slotsArray.sort((a, b) => a.slot_number - b.slot_number);
        setSlots(slotsArray);
      } else {
        setSlots([]);
      }
    });
  }, []);

  const handleDeleteSlot = (id) => {
    const slotRef = ref(db, `parking_slots/${id}`);
    remove(slotRef)
      .then(() => {
        console.log(`Slot ${id} deleted successfully`);
      })
      .catch((error) => {
        console.error('Error deleting slot:', error);
      });
  };

  return (
    <div>
      <h2>Parking Slots</h2>
      <table>
        <thead>
          <tr>
            <th>Slot Number</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td>{slot.slot_number}</td>
              <td>{slot.status}</td>
              <td>
                <button onClick={() => handleDeleteSlot(slot.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlotsTable;
