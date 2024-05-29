import React, { useState, useEffect } from "react";
import axios from 'axios';
import { db } from "../firebase"; // Import the Firebase db instance from firebase.js
import { ref, get, update } from 'firebase/database'; 

function Cctv() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);
  const [slot,setSlot] = useState(null);
  const [userid, setUserid] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [slotId, setSlotId] = useState("");

  // useEffect(() => {                                                         // While using CCTV 
  //   const intervalId = setInterval(capture, 5000); // Capture image every 5 seconds
  //   return () => clearInterval(intervalId);
  // }, []);

  // const capture = async () => {                                             // While using CCTV 
  //   try {
  //     const response = await axios.post('http://127.0.0.1:5000/upload');
  //     setVehicleNumber(response.data.vehicle_number);
  //   //   setError("");
  //   } catch (error) {
  //   //   console.error("Error:", error);
  //     setError(error.response.data.error);
  //   }
  // }

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    // Fetch user details and timestamps when the vehicle number changes
    if (vehicleNumber) {
      fetchUserDetails(vehicleNumber);
      // sendEmail();
      // console.log(slotId);
      // console.log(userid);
    }
  }, [vehicleNumber]); // Include vehicleNumber

  // useEffect(() => {
  //   // Check if email is not null and then send the email
  //   if (email !== null) {
  //     const config = {
  //       Username: "ghrishi02@gmail.com",
  //       Password: "A032049DD00B80467E0AB5AB6A55E04FCFCB",
  //       Host: "smtp.elasticemail.com",
  //       Port: 2525,
  //       To: email,
  //       From: "ghrishi02@gmail.com",
  //       Subject: "This is from SMTP",
  //       Body: `HELLO ${email}`
  //     };
  //     console.log(email); // Ensure that email is not null
  //    window.Email.send(config).then(()=>alert("email sent")); // Uncomment this line when you want to send the email
  //   }
  // }, [email]); // Run this effect whenever email changes
  
  // Move this email sending logic outside the main component body
  
  
  // Call sendEmail whenever email changes
  // useEffect(() => {
  //   sendEmail();
  // }, [email]);
  
 
  const emailBody = `
  <div style="border: 1px solid #ccc; border-radius: 5px; padding: 20px;">
    <h3>Dear ${name},</h3>
    <p>We hope this message finds you well.</p>
    <p>We would like to inform you that a parking spot is available for you at our parking lot. Here are the details:</p>
    <div style="padding-left: 20px;">
      <p style="color: red;"><strong>Nearest Slot to park:</strong> ${slot}</p>
    </div>
    <p>Please proceed to park at the designated spot at your earliest convenience.</p>
    <p>Thank you for choosing SpotSense.AI.</p>
    <p>Best regards,<br>Team SpotSense.AI</p>
  </div>
  `;
  const sendEmail =  (userId) => {
    // await fetchUserDetails(vehicleNumber);
    // await fetchAvailableSlots();
    // console.log(userDetails);
    if (email !== null) {
      const config = {
        Username: "ghrishi02@gmail.com",
        Password: "A032049DD00B80467E0AB5AB6A55E04FCFCB",
        Host: "smtp.elasticemail.com",
        Port: 2525,
        To: email,
        From: "ghrishi02@gmail.com",
        Subject: "SpotSense.AI",
        Body: emailBody
      };
      window.Email.send(config).then(() => {
        alert("Email sent");
        autoBookkSlot(userId);
      }).catch(error => {
        console.error("Error sending email:", error);
        setError("Error occurred while sending email");
      });
    } else {
      console.log("No email");
    }
  };

  const exitEmail = `
  <div style="border: 1px solid #ccc; border-radius: 5px; padding: 20px;">
  <h3>Dear ${name},</h3>
  <p>We hope this message finds you well.</p>
  <div style="padding-left: 20px;">
  <p style="color: red;"><strong>Your vehicle has been exited from Slot no.: </strong> ${slot}</p>
  </div>
  <p>Thank you for choosing SpotSense.AI.</p>
    <p>Best regards,<br>Team SpotSense.AI</p>
</div>`

  const sendExitEmail =  (userId) => {
    // await fetchUserDetails(vehicleNumber);
    // await fetchAvailableSlots();
    // console.log(userDetails);
    if (email !== null) {
      const config = {
        Username: "ghrishi02@gmail.com",
        Password: "A032049DD00B80467E0AB5AB6A55E04FCFCB",
        Host: "smtp.elasticemail.com",
        Port: 2525,
        To: email,
        From: "ghrishi02@gmail.com",
        Subject: "SpotSense.AI",
        Body: exitEmail
      };
      window.Email.send(config).then(() => {
        alert("Email sent");
      }).catch(error => {
        console.error("Error sending email:", error);
        setError("Error occurred while sending email");
      });
    } else {
      console.log("No email");
    }
  };
  
  const autoBookkSlot = (userId) => {
    console.log("Called Book Slot");
    if (!userId || !slotId) {
      console.error("userId or slotId is undefined");
      return;
    }
    const userRef = ref(db, `users/${userId}`);
    update(userRef, {
      booked_slot: slotId
    })
    .then(() => {
      console.log('User document updated with booked slot');
      // Once user document is updated, update parking slot status
      const slotRef = ref(db, `parking_slots/${slotId}`);
      update(slotRef, {
        status: 'booked',
        booked_by: userId,
      })
      .then(() => {
        console.log('Parking slot status updated');
        console.log('Slot booked successfully');
      })
      .catch((error) => {
        console.error('Error updating parking slot status:', error);
      });
    })
    .catch((error) => {
      console.error('Error updating user document with booked slot:', error);
    });
  }
  
  const fetchAvailableSlots = async () => {
    try {
      const slotsRef = ref(db, 'parking_slots');
      const snapshot = await get(slotsRef);
  
      if (snapshot.exists()) {
        const slots = snapshot.val();
        const availableSlots = Object.values(slots).filter(slot => slot.status === 'available');
        availableSlots.sort((a, b) => a.slot_number - b.slot_number);
  
        if (availableSlots.length > 0) {
          // Set the slotId to the first available slot's id
          const slotId = Object.keys(slots).find(key => slots[key].slot_number === availableSlots[0].slot_number);
          setSlotId(slotId);
          setSlot(availableSlots[0].slot_number);
        } else {
          console.log("No available slots");
        }
  
        setAvailableSlots(availableSlots);
      } else {
        console.error('No slots found in the database');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError("Error occurred while fetching data");
    }
  };
  

  const fetchUserDetails = async (vehicleNumber) => {
    try {
      const userRef = ref(db, 'users');
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userId = Object.keys(users).find(userId => users[userId].vehicle === vehicleNumber);

        
        if (userId) {
          setUserDetails(users[userId]);

          const userEmail = users[userId].email;
          const userName = users[userId].name;
          setEmail(userEmail);
          setName(userName);
          // setUserid(userId);


          let userTimestamps = users[userId].timestamps;
  
          // Check if userTimestamps is an object, convert to array if necessary
          if (userTimestamps && typeof userTimestamps === 'object') {
            userTimestamps = Object.values(userTimestamps);
          } else if (!Array.isArray(userTimestamps)) {
            userTimestamps = [];
          }
  
          setTimestamps(userTimestamps);
  
          // Check if the last entry in the timestamps array has an exit time
          const lastTimestamp = userTimestamps[userTimestamps.length - 1];
          if (lastTimestamp && lastTimestamp.entry && !lastTimestamp.exit) {
            // Update the exit time of the last entry
            const currentTime = new Date().toISOString(); // Get the current timestamp in ISO format
            lastTimestamp.exit = currentTime;
            await update(ref(db, `users/${userId}/timestamps/${userTimestamps.length - 1}`), { exit: currentTime });
            const userRef = ref(db, `users/${userId}`);
            update(userRef, {
              booked_slot : null
            })
            const slotRef = ref(db, `parking_slots/${slotId}`);
            update(slotRef, {
              status: 'available',
              booked_by: null,
            })
              .then(() => {
                console.log('Slot Exited successfully');
                sendExitEmail(userid);
              })
              .catch((error) => {
                console.error('Error booking slot:', error);
              });
           
            console.log("Exit time updated in the database.");
          } else {
            // Add new entry time if no exit time is present in the last entry
            const currentTime = new Date().toISOString();       // Get the current timestamp in ISO format
            const newTimestamp = { entry: currentTime , booked_slot: slotId};
            userTimestamps.push(newTimestamp);                  // Append new timestamp to the array
            await update(ref(db, `users/${userId}`), { timestamps: userTimestamps, booked_slot: slotId});
            sendEmail(userId);
            setUserid(userId);
            console.log("Entry time stored in the database.");
          }
        } else {
          console.error('User not found for the provided vehicle number');
        }
      } else {
        console.error('No users found in the database');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError("Error occurred while fetching data");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Not available'; 
  
    // Convert timestamp to local time and format it
    const localTime = new Date(timestamp);
    return localTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }

  return (
    <div className="Container">
       <h1>Result: {response ? response : error}</h1>
      <input
        type="text"
        placeholder="Enter Vehicle Number"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />

      <div>
        {error ? <p>Error: {error}</p> : null}
        {userDetails && (
          <div>
            <h2>User Details</h2>
            <p>User Id: {userid}</p>
            <p>Vehicle No.: {userDetails.vehicle}</p>
            <p>Name: {userDetails.name}</p>
            <p>Email: {userDetails.email}</p>
          </div>
        )}
        <div>
          {timestamps.length > 0 && (
            <div>
              <h2>Timestamps</h2>
              <ul>
                {timestamps.map((timestamp, index) => (
                  <li key={index}>
                    {formatTime(new Date(timestamp.entry))} - {timestamp.exit ? formatTime(new Date(timestamp.exit)) : 'Not exited yet'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2>Available Slots</h2>
            {availableSlots.length > 0 ? (
              <ul>
                {availableSlots.map((slot, index) => (
                  <li key={index}>
                    Slot Number: {slot.slot_number} | Status: {slot.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No available slots</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cctv;
