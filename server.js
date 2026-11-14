const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '15mb' })); // పెద్ద ప్రొఫైల్ ఫోటోలు లేదా డేటా సేవ్ కావడానికి
app.use(cors());

// MongoDB Atlas Cloud Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Atlas Cloud Database Connected Successfully!");
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
});

// 1. User Schema & Model (Admin & Staff Accounts Sync)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    data: { type: Object, required: true }
});
const CloudUser = mongoose.model('CloudUser', userSchema);

// 2. Lead / Client Schema & Model (Marketing & Finance Sync)
const leadSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    client: String,
    phone: String,
    total: Number,
    adv: Number,
    pend: Number,
    emp: String,
    date: String
});
const CloudLead = mongoose.model('CloudLead', leadSchema);

// 3. Support Call Schema & Model (Customer Support Logs Sync)
const supportCallSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    callerName: String,
    callerPhone: String,
    category: String,
    status: String,
    notes: String,
    agentId: String,
    timestamp: String
});
const CloudSupportCall = mongoose.model('CloudSupportCall', supportCallSchema);


// --- API ROUTES ---

// Get All Users (Admin & Staff)
app.get('/api/users', async (req, res) => {
    try {
        const users = await CloudUser.find({});
        const usersMap = {};
        users.forEach(u => {
            usersMap[u.userId] = u.data;
        });
        res.json(usersMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users from cloud" });
    }
});

// Save or Update User (Admin Password, Staff Passwords & Profiles Sync)
app.post('/api/users', async (req, res) => {
    try {
        const { userId, data } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "UserId is required" });
        }

        if (data === null) {
            await CloudUser.deleteOne({ userId });
            return res.json({ success: true, message: "User deleted" });
        }

        await CloudUser.findOneAndUpdate(
            { userId: userId },
            { userId: userId, data: data },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "User data synced successfully to MongoDB!" });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ error: "Failed to sync user data to cloud" });
    }
});

// Get All Client Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await CloudLead.find({});
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leads" });
    }
});

// Create or Save Client Lead
app.post('/api/leads', async (req, res) => {
    try {
        const leadData = req.body;
        await CloudLead.findOneAndUpdate(
            { id: leadData.id },
            leadData,
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Lead saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save lead" });
    }
});

// Get All Support Calls
app.get('/api/support-calls', async (req, res) => {
    try {
        const calls = await CloudSupportCall.find({});
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch support calls" });
    }
});

// Log Support Call
app.post('/api/support-calls', async (req, res) => {
    try {
        const callData = req.body;
        await CloudSupportCall.findOneAndUpdate(
            { id: callData.id },
            callData,
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Support call logged successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to log support call" });
    }
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});