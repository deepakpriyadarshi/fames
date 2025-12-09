import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5000,
        host: "0.0.0.0",
        allowedHosts: ["ablecredit.deepakpriyadarshi.com", "localhost"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
