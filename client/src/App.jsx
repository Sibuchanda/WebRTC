import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import RoomPage from "./pages/Roompage";


function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<RoomPage/>} />
        </Routes>
    </>
  );
}

export default App;
