// import React, { useState, useEffect } from 'react';
// import firebase from 'firebase/app';
// import 'firebase/database';

const Parking_slot = () => {
  // const [parkingSlots, setParkingSlots] = useState([]);

//   useEffect(() => {
//     const slotsRef = firebase.database().ref('parking_slots');

//     slotsRef.on('value', (snapshot) => {
//       const slotsData = snapshot.val();
//       const slotsArray = Object.entries(slotsData).map(([slotId, slotData]) => ({
//         id: slotId,
//         ...slotData,
//       }));
//       setParkingSlots(slotsArray);
//     });

//     // Clean up the listener on unmount
//     return () => slotsRef.off();
//   }, []);

  // return (
  //   <div>
  //     <h1>Parking Slots</h1>
  //     <ul>
  //       {parkingSlots.map(slot => (
  //         <li key={slot.id}>
  //           Slot Number: {slot.slot_number} | Status: {slot.status}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
};

export default Parking_slot;
