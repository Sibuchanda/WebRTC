import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import { Roompage } from "./pages/Roompage";

import { PeerProvider } from "./providers/peer";


function App() {
  return (
    <>
      <PeerProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Roompage/>} />
        </Routes>
        </PeerProvider>
    </>
  );
}

export default App;
