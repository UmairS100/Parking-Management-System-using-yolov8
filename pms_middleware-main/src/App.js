import './App.css';
import Cctv from './components/Cctv';

function App() {
  return (
    <div>
    <Cctv/>
    </div>
  );
}

export default App;
// in firebase my realtime database looks like 
// |-parking_slots
//    |-slot1
//        |-booked_by:"null"
//        |-slot_number:1
//        |-status:"available"
//   |-slot2
// |-users
//     |-2T15y2XA31coxOGfeqdDqaSaQjc2
//          |-email:"vu4f2021069@pvppcoe.ac.in"
//          |-name:"lavkush"
//          |-timestamps
//              |-0
//                   |-entry:"2024-04-04T06:36:05.614Z"
//                   |-exit:"2024-04-04T06:36:13.972Z"
//             |-1
//                   |-entry:"2024-04-04T06:36:18.326Z"
//                   |-exit:"2024-04-04T06:36:28.925Z"
//       |-vehicle:"MH12DE1433"
//    |-q4b0p4rdJuY3a8ZF7H9o6UF0MvH3


