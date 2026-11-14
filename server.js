const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' })); // పెద్ద ఇమేజ్ / ప్రొఫైల్ ఫోటోల కోసం లిమిట్ పెంచాం
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Atlas కనెక్షన్
mongoose.connect(MONGO_URI)
.then(() => {
    console.log("MongoDB Atlas Cloud Database Connected Successfully!");
})
.catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
});

// --- MONGOOSE SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    name: String,
    pass: String,
    role: String,
    phone: String,
    email: String,
    address: String,
    photo: String
});
const User = mongoose.model('User', userSchema);

const leadSchema = new mongoose.Schema({
    id: String,
    client: String,
    phone: { type: String, unique: true },
    total: Number,
    adv: Number,
    pend: Number,
    emp: String,
    date: String
});
const Lead = mongoose.model('Lead', leadSchema);

const supportCallSchema = new mongoose.Schema({
    id: String,
    callerName: String,
    callerPhone: String,
    category: String,
    status: String,
    notes: String,
    agentId: String,
    timestamp: String
});
const SupportCall = mongoose.model('SupportCall', supportCallSchema);

// --- API ROUTES ---

// 1. Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        let userMap = {};
        users.forEach(u => {
            userMap[u.userId] = { name: u.name, pass: u.pass, role: u.role, phone: u.phone, email: u.email, address: u.address, photo: u.photo };
        });
        res.json(userMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Save / Update User
app.post('/api/users', async (req, res) => {
    try {
        const { userId, data } = req.body;
        await User.findOneAndUpdate({ userId }, { userId, ...data }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get All Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find();
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Save / Update Lead
app.post('/api/leads', async (req, res) => {
    try {
        const leadData = req.body;
        await Lead.findOneAndUpdate({ phone: leadData.phone }, leadData, { upsert: true, new: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Support Calls
app.get('/api/support-calls', async (req, res) => {
    try {
        const calls = await SupportCall.find().sort({ _id: -1 });
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Save Support Call
app.post('/api/support-calls', async (req, res) => {
    try {
        const callData = req.body;
        await SupportCall.create(callData);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send("Tekkali Digital & Web Solutions Hub - Cloud ERP Backend is Running Live!");
});

app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});