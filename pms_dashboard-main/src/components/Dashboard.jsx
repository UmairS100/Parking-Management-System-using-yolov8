import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { getAuth, setPersistence, browserLocalPersistence, signOut } from 'firebase/auth';
import '../css/Dashboard.css';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import html2pdf from 'html2pdf.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const [slotBooked, setSlotBooked] = useState(false);
  const [exit, setexit] = useState(true);
  const[info, setInfo] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribeUserData = onValue(ref(db, `users/${auth.currentUser.uid}`), (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            setUserData(null);
          }
        });
        const unsubscribeParkingSlots = onValue(ref(db, 'parking_slots'), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const newData = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            newData.sort((a, b) => a.slot_number - b.slot_number);
            setParkingSlots(newData);
          } else {
            setParkingSlots([]);
          }
        });

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
          if (user) {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
        });

        // Fetch timestamps for the current user
        const unsubscribeTimestamps = onValue(ref(db, `users/${auth.currentUser.uid}/timestamps`), (snapshot) => {
          if (snapshot.exists()) {
            const timestampsData = snapshot.val();
            setTimestamps(Object.values(timestampsData));
          } else {
            setTimestamps([]);
          }
        });

        return () => {
          unsubscribeUserData();
          unsubscribeParkingSlots();
          unsubscribeAuth();
          unsubscribeTimestamps(); // Unsubscribe from timestamps
        };
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, []);

  useEffect(() => {
    // Check if any timestamps have an exit time
    const hasExitTime = timestamps.some(timestamp => timestamp.exit=== undefined);

    // Update the exit state accordingly
    setexit(!hasExitTime);
    console.log(exit);
  }, [timestamps]);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
        console.log("Signed Out");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleSlotSelection = (slot) => {
    if (!userData) {
      alert('Please sign in to view slot details.');
      return;
    }
  
    // Check if the user has already booked a slot
    if (userData.booked_slot) {
      alert('You have already booked a slot. Please cancel your current booking to book another slot.');
      return;
    }
  
    // Check if the user's vehicle is parked
    if (timestamps.length > 0) {
      const lastTimestamp = timestamps[timestamps.length - 1];
      if (lastTimestamp.entry && !lastTimestamp.exit) {
        alert('Your vehicle is currently parked. Please exit the parking slot before booking another slot.');
        return;
      }
    }
  
    // Check if the slot is already booked by another user
    if (slot.status === 'booked' && slot.booked_by !== auth.currentUser.uid) {
      alert('This slot is already booked by another user.');
      return;
    }
  
    // Proceed with slot booking logic
    if (slot.status === 'booked' && slot.booked_by === auth.currentUser.uid) {
      const bookedSlot = parkingSlots.find((item) => item.id === slot.id);
      if (bookedSlot) {
        alert(`You have already booked slot ${bookedSlot.slot_number}.`);
      }
    } else if (slot.status === 'available') {
      const confirmed = window.confirm(`Do you want to book slot ${slot.slot_number}?`);
      if (confirmed) {
        handleBooking(slot);
        setSlotBooked(true); // Set slot booked state to true
      }
    }
  };
  
  const handleCancelBooking = (slot) => {
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    update(userRef, {
      booked_slot : null
    })
    const slotRef = ref(db, `parking_slots/${slot.id}`);
    update(slotRef, {
      status: 'available',
      booked_by: null,
    })
      .then(() => {
        console.log('Slot booking canceled successfully');
        setUserData(prevUserData => ({
          ...prevUserData,
          booked_slot: null // Update booked_slot to null
        }));
      })
      .catch((error) => {
        console.error('Error canceling booking:', error);
      });
  };
  
  
  const handleBooking = (slot) => {
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    update(userRef, {
      booked_slot : slot.id
    })
    const slotRef = ref(db, `parking_slots/${slot.id}`);
    update(slotRef, {
      status: 'booked',
      booked_by: auth.currentUser.uid,
    })
      .then(() => {
        console.log('Slot booked successfully');
      })
      .catch((error) => {
        console.error('Error booking slot:', error);
      });
  };

  // Function to calculate time difference between entry and exit
  const getTimeDifference = (entryTime, exitTime) => {
    if (!exitTime) return 'Not exited yet';
    const entryTimestamp = new Date(entryTime).getTime();
    const exitTimestamp = new Date(exitTime).getTime();
    const difference = exitTimestamp - entryTimestamp;
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hours, ${minutes} minutes`;
  };

  // const handleInvoiceDownload = (timestamp) => {
  //   // Generate the invoice content
  //   const invoiceContent = `
  //   -------------------------------------------------------
  //                       Invoice
  //   -------------------------------------------------------
  //   Entry Time: ${new Date(timestamp.entry).toLocaleString()}
  //   Exit Time: ${timestamp.exit ? new Date(timestamp.exit).toLocaleString() : 'Not exited yet'}
  //   Time Difference: ${getTimeDifference(timestamp.entry, timestamp.exit)}
  //   Slot Number: ${timestamp.booked_slot}
  //   Price: ${calculatePrice(timestamp.entry, timestamp.exit)}
  //   -------------------------------------------------------
  // `;
    
  //   // Create a Blob containing the invoice content
  //   const blob = new Blob([invoiceContent], { type: 'text/plain' });
    
  //   // Create a URL for the Blob
  //   const url = window.URL.createObjectURL(blob);
    
  //   // Create a link element to trigger the download
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = 'invoice.txt';
    
  //   // Append the link to the document body and trigger the click event
  //   document.body.appendChild(link);
  //   link.click();
    
  //   // Clean up by revoking the URL and removing the link from the document body
  //   window.URL.revokeObjectURL(url);
  //   document.body.removeChild(link);
  // };
  
  const handleInvoiceDownload = (timestamp) => {
   
    // Generate the invoice content
    const invoiceContent = `
    <html>
      <head>
        <meta charset="utf-8" />    
        <style>
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
          }
    
          .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
          }
    
          .invoice-box table td {
            padding: 5px;
            vertical-align: top;
          }
    
          .invoice-box table tr td:nth-child(2) {
            text-align: right;
          }
    
          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }
    
          .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
          }
    
          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }
    
          .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
          }
    
          .invoice-box table tr.details td {
            padding-bottom: 20px;
          }
    
          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
          }
    
          .invoice-box table tr.item.last td {
            border-bottom: none;
          }
    
          .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
          }
    
          @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
              width: 100%;
              display: block;
              text-align: center;
            }
    
            .invoice-box table tr.information table td {
              width: 100%;
              display: block;
              text-align: center;
            }
          }
    
          /** RTL **/
          .invoice-box.rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
          }
    
          .invoice-box.rtl table {
            text-align: right;
          }
    
          .invoice-box.rtl table tr td:nth-child(2) {
            text-align: left;
          }
        </style>
      </head>
    
      <body>
        <div class="invoice-box">
          <table cellpadding="0" cellspacing="0">
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      <img
                        src="spotsens.png"
                        style="width: 100%; max-width: 300px;
                        height:200px"
                      />
                    </td>
    
                    <td>
                      Invoice #: 999<br />
                      Created: January 1, 2023<br />
                      Due: February 1, 2023
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
    
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      SpotSense.ai<br />
                      Altamount Road, Cumballa Hill <br />
                      Mumbai, Maharashtra, 400026
                    </td>
    
                    <td>
                      ${userData.name}<br />
                      ${userData.vehicle}<br />
                      ${userData.email}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
    
            <tr class="heading">
              <td>Payment Method</td>
    
              <td>Check #</td>
            </tr>
    
            <tr class="details">
              <td>UPI</td>
    
              <td>1000</td>
            </tr>
    
            <tr class="heading">
              <td>Details</td>
    
              <td>Time</td>

            </tr>  
            <tr class="item">
              <td>Entry Time</td>
    
              <td>${new Date(timestamp.entry).toLocaleString()}</td>
            </tr>

            <tr class="item">
            <td>Exit Time</td>
  
            <td>${new Date(timestamp.exit).toLocaleString()}</td>
          </tr>

          <tr class="item">
          <td>Time Difference</td>

          <td>${getTimeDifference(timestamp.entry, timestamp.exit)}</td>
        </tr>
            <tr class="total">
              <td></td>
    
              <td>Total:${calculatePrice(timestamp.entry, timestamp.exit)}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
      
    `;
  
    // Convert HTML content to PDF
    html2pdf().from(invoiceContent).save();
  };
  // Function to calculate the price based on parking duration
const calculatePrice = (entryTime, exitTime) => {
  if (!exitTime) return 'Not exited yet';
  
  const entryTimestamp = new Date(entryTime).getTime();
  const exitTimestamp = new Date(exitTime).getTime();
  const durationInMilliseconds = exitTimestamp - entryTimestamp;
  const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
  
  // Define pricing rules
  const basePrice = 200;
  const halfHourlyRate = 70;
  const dailyRate = 800;
  
  let price = 0;
  
  if (durationInHours <= 1) {
    price = basePrice;
  } else if (durationInHours <= 24) {
    price = basePrice + Math.ceil((durationInHours - 1) * halfHourlyRate);
  } else {
    price = dailyRate;
  }
  
  return `Rs ${price}`;
};
const toggleInfo = () => {
  setInfo(!info); // Toggle the value of info between true and false
};
  return (
    <div className='userDashboard'>
      <div className='right-div'>
      <button className="right-button" title="Display parking charges" onClick={toggleInfo}><InfoTwoToneIcon color="secondary"  fill="none"
    sx={{ fontSize: 30 }}/></button>
        
        {info && (
          <div className='right-info'>
          <p>
            <strong>1.</strong>
          Base Price: The base price is set to Rs 200. This is the initial price charged for parking up to the first hour.
          </p>
          <p>
          <strong>2.</strong>
          Half-Hourly Rate: After the first hour, the pricing changes. For every additional half-hour beyond the first hour, an extra Rs 70 is charged.
          </p>
          <p>
          <strong>3.</strong>
          Daily Rate: If the vehicle is parked for more than 24 hours, a flat rate of Rs 800 is charged for the entire day.
          </p>
          </div>
        )}
        
      </div>
      {authenticated ? (
        <>
          {/* User Details Section */}
          {userData ? (
            <div className="userDetailsCard">
              <h2>User Data:</h2>
              <p>ID: {auth.currentUser.uid}</p>
              <p>Name: {userData.name}</p>
              <p>Email: {userData.email}</p>
              <p>Vehicle Number: {userData.vehicle}</p>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
  
          {/* Parking Slots Section */}
  
          <div className='slot_div'>
            <div className={userData && userData.booked_slot ? 'plane_flex' : 'plane'}>
              <ol className="cabin fuselage">
                {parkingSlots.map(slot => (
                  <li key={slot.id} className="seat">
                    {/* Slot details */}
                    {userData && userData.booked_slot === slot.id && (
                      <div className="booked_seat">
                        <p>Slot Number: {slot.slot_number}</p>
                        <p>Status: Booked</p>
                        <button  className={exit ? 'show_canel' : 'hide_cancel'} onClick={() => handleCancelBooking(slot)}>Cancel Booking</button>
                      </div>
                    )}
                    {!userData.booked_slot && (
                      <>
                        <button
                          className='seat_booking'
                          onClick={() => handleSlotSelection(slot)}
                          disabled={slot.status === 'booked' && slot.booked_by !== auth.currentUser.uid}
                        >
                          Book Slot {slot.slot_number}
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
  
  
          {/* Timestamps Section */}
          <div className="table-container">
            <h2>Timestamps</h2>
            <table>
              <thead>
                <tr>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  {/* <th>Time Difference</th>
                  <th>Price</th> */}
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
              {timestamps.slice().reverse().map((timestamp, index) => (
                <tr key={index}>
                  <td>{new Date(timestamp.entry).toLocaleString()}</td>
                  <td>{timestamp.exit ? new Date(timestamp.exit).toLocaleString() : 'Not exited yet'}</td>
                  {/* <td>{getTimeDifference(timestamp.entry, timestamp.exit)}</td>
                  <td>{calculatePrice(timestamp.entry, timestamp.exit)}</td> */}
                  <td>
                    <button onClick={() => handleInvoiceDownload(timestamp)}>Invoice</button>
                  </td>
                </tr>
              ))}
                {/* {timestamps.slice().reverse().map((timestamp, index) => (
                  <tr key={index}>
                    <td>{new Date(timestamp.entry).toLocaleString()}</td>
                    <td>{timestamp.exit ? new Date(timestamp.exit).toLocaleString() : 'Not exited yet'}</td>
                    <td>{getTimeDifference(timestamp.entry, timestamp.exit)}</td>
                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
  
        </>
      ) : (
        <div className='notLoginDashboard'>
          <p>Please sign in to view user data.</p>
          <Link to="/login">Click here to Login</Link>
        </div>
      )}
      {authenticated && (
        <button onClick={userSignOut}>Sign out</button>
      )}
    </div>
  );
  
}  
