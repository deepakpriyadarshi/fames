import { Routes, Route } from "react-router-dom";
import { Login } from "@/views/Login";
import { Signup } from "@/views/Signup";
import Documents from "@/views/Documents";

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/documents" element={<Documents />} />
        </Routes>
    );
};

export default App;
