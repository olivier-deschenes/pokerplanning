import { Route, Routes } from "react-router-dom";
import { Home } from "./components/home/Home";
import { Session } from "./components/session/Session";

function App() {
  return (
    <div className={"w-screen h-screen bg-red-600"}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="session/:id" element={<Session />} />
      </Routes>
    </div>
  );
}

export default App;
