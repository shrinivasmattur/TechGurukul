import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + "/.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = [];
const userIdCounter = { id: 1 };

// Helper to generate token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

// Helper to verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Middleware to check auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  req.userId = decoded.userId;
  next();
};

// Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user exists
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: userIdCounter.id++,
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      created_at: new Date().toISOString(),
    };

    users.push(user);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          created_at: user.created_at,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// AI Chatbot Knowledge Base
const knowledgeBase = {
  courses: {
    keywords: ["course", "program", "study", "degree", "what do you offer", "curriculum"],
    response: "🎓 We offer comprehensive programs in:\n• Computer Science\n• Business Administration\n• Engineering\n• Data Science\n• Liberal Arts\n\nEach program is designed with industry experts to ensure you're job-ready on graduation!"
  },
  placements: {
    keywords: ["placement", "job", "career", "company", "recruit", "salary", "placement rate"],
    response: "💼 Our placement statistics:\n• 95% placement rate\n• Average package: INR 12-15 LPA\n• Top recruiters: Google, Microsoft, Amazon, TCS, Infosys\n• 500+ companies visit our campus\n\nWe provide career counseling, interview prep, and networking events throughout the year!"
  },
  fees: {
    keywords: ["fee", "cost", "price", "tuition", "scholarship", "financial", "afford"],
    response: "💰 Fee Structure (per year):\n• Undergraduate: INR 2,50,000 - 3,50,000\n• Postgraduate: INR 3,00,000 - 4,50,000\n\nScholarships available:\n• Merit-based: Up to 50% off\n• Need-based: Full & partial scholarships\n• Category-based: For SC/ST/OBC students\n\nEMI options available for parents!"
  },
  admissions: {
    keywords: ["admission", "apply", "application", "entrance", "exam", "eligibility", "requirement", "how to apply"],
    response: "📝 Admission Process:\n1. Complete online application form\n2. Submit entrance exam scores\n3. Merit-based shortlisting\n4. Personal interview\n5. Offer letter & admission\n\nEligibility: 12th pass with 50%+ marks\nDeadline: July 31, 2026\n\nNeed help with the application? Contact our admissions team!"
  },
  campus: {
    keywords: ["campus", "life", "student", "activity", "club", "event", "hostel", "facility"],
    response: "🏫 Campus Life at TechGurukul:\n• Modern infrastructure with smart classrooms\n• Sports complex & gym\n• Student clubs (Tech, Cultural, Sports)\n• Annual fest & tech events\n• On-campus hostel with modern amenities\n• 24/7 WiFi & cafeteria\n\nWe believe in holistic development beyond academics!"
  },
  counseling: {
    keywords: ["counseling", "career counsel", "guidance", "mentor", "advisor"],
    response: "🗣️ Our Counseling Services:\n• Career counseling sessions\n• 1-on-1 mentoring with industry professionals\n• Resume building & interview prep\n• Internship guidance\n• Personal development workshops\n\nBook a free consultation call with our counselors!"
  }
};

// Chat endpoint with AI
app.post("/api/chat/message", authMiddleware, (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const userMessage = message.toLowerCase().trim();
    let botResponse = "";

    // Check for keyword matches
    for (const [topic, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => userMessage.includes(keyword))) {
        botResponse = data.response;
        break;
      }
    }

    // Default response if no keywords match
    if (!botResponse) {
      botResponse = "Thanks for your question! 😊 I'm here to help with:\n• Courses & programs\n• Placements & careers\n• Fee structure & scholarships\n• Admissions process\n• Campus life\n• Counseling services\n\nFeel free to ask about any of these topics!";
    }

    res.json({
      success: true,
      data: {
        message: botResponse
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});


app.get("/api/vapi/call", async (req, res) => {
  try {
    console.log("📞 Initiating Vapi Call...");

    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: "+919353412846", // change to your number
          name: "Shrinivas"
        }
      }),
    });

    const data = await response.json();

    console.log("✅ Vapi Response:", data);

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: data,
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("❌ Vapi Error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Me: GET http://localhost:${PORT}/api/auth/me`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/api/chat/message`);
});
