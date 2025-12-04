import { Routes, Route } from "react-router-dom";
import { Login } from "@/views/Login";
import Dashboard from "@/views/Dashboard";

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
};

export default App;
