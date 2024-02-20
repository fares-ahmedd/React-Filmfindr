import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StartRating from "./starRating";
const root = ReactDOM.createRoot(document.getElementById("root"));
// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StartRating color="blue" maxRating={10} onSetRating={setMovieRating} />;
//       <p>This movie was rated {movieRating} Stars</p>
//     </div>
//   );
// }
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
