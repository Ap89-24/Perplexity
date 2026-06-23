import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import testAi from "./src/services/ai.service.js";



const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT , () => {
    console.log(`Server in running on port ${PORT}`);
})