import { Routes, Route } from "react-router-dom";
import { Login } from "@/views/Login";
import Documents from "@/views/Documents";

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/documents" element={<Documents />} />
        </Routes>
    );
};

export default App;
