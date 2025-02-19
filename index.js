const express = require('express'); 
const cors = require('cors');
require("dotenv").config();

const API_KEY = process.env.API_KEY;
const app = express(); 
const PORT = process.env.PORT || 4000; 

app.use(cors());
app.use(express.json()); // Enable JSON body parsing

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI model
const genAI = new GoogleGenerativeAI(API_KEY);

async function analyzeLogs(logs) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
Analyze the following logs and provide:

1. Brief Summary:
   - Provide a short summary of the logs.

2. Errors, Inefficiencies, or Performance Issues:
   - List any errors, inefficiencies, or performance issues found in the logs.

3. Solutions or Improvements:
   - Suggest solutions or improvements to fix the identified issues.

4. dont use * in the beginning or end of any line

Logs:
${logs}
`;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error processing AI request:", error);
        return "Failed to process the request.";
    }
}

// **Change from GET to POST**
app.post('/analyze', async (req, res) => {
    try {
        const { logs } = req.body; // Extract logs from request body
        if (!logs || logs.trim() === "") {
            return res.status(400).json({ error: "No logs provided." });
        }

        console.log("Received logs for analysis:", logs.substring(0, 200)); // Log first 200 chars for debugging

        const analysis = await analyzeLogs(logs);
        
        res.status(200).json({ analysis }); // Send structured response
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
