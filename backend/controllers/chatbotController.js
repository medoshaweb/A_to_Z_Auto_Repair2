const { OpenAI } = require("openai");
require("dotenv").config();

// Initialize OpenAI (will work even if API key is not set - will return error message)
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.log("OpenAI not configured. Chatbot will use fallback responses.");
}

const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // If OpenAI is configured, use it
    if (openai && process.env.OPENAI_API_KEY) {
      const messages = [
        {
          role: "system",
          content: `You are a helpful assistant for A to Z Auto Repair. 
          You help customers with:
          - Service inquiries and scheduling
          - Pricing questions
          - Service hours: Monday-Saturday 7:00AM-6:00PM
          - Phone: 1800 456 7890
          - Address: 54B, Tailstoi Town 5238 MT, La city, IA 522364
          
          Be friendly, professional, and concise. If asked about scheduling, 
          direct them to log in and use the "Request Service" feature.`,
        },
        ...conversationHistory,
        { role: "user", content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
      });

      return res.json({
        response: completion.choices[0].message.content,
      });
    } else {
      // Fallback responses if OpenAI is not configured
      const lowerMessage = message.toLowerCase();

      let response = "";

      if (
        lowerMessage.includes("hours") ||
        lowerMessage.includes("open") ||
        lowerMessage.includes("time")
      ) {
        response =
          "We're open Monday through Saturday from 7:00 AM to 6:00 PM. We're closed on Sundays.";
      } else if (
        lowerMessage.includes("phone") ||
        lowerMessage.includes("call") ||
        lowerMessage.includes("contact")
      ) {
        response =
          "You can reach us at 1800 456 7890. Our hours are Monday-Saturday 7:00AM-6:00PM.";
      } else if (
        lowerMessage.includes("address") ||
        lowerMessage.includes("location") ||
        lowerMessage.includes("where")
      ) {
        response =
          "We're located at 54B, Tailstoi Town 5238 MT, La city, IA 522364.";
      } else if (
        lowerMessage.includes("price") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("how much")
      ) {
        response =
          "Pricing varies by service type and vehicle. Please log in to request a service and we'll provide an accurate quote. You can also call us at 1800 456 7890 for pricing information.";
      } else if (
        lowerMessage.includes("schedule") ||
        lowerMessage.includes("appointment") ||
        lowerMessage.includes("book")
      ) {
        response =
          "To schedule a service, please log in to your account and use the 'Request Service' feature. If you don't have an account, you can sign up for free!";
      } else if (
        lowerMessage.includes("service") ||
        lowerMessage.includes("repair")
      ) {
        response =
          "We offer a wide range of services including oil changes, brake repairs, engine service, transmission work, battery replacement, tire services, and more. Log in to see all available services and request one!";
      } else {
        response =
          "I'm here to help! You can ask me about our services, hours, location, or pricing. For scheduling, please log in to your account. Need more help? Call us at 1800 456 7890.";
      }

      return res.json({ response });
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      message: "Chatbot service unavailable. Please try again later.",
      response:
        "I'm having trouble right now. Please call us at 1800 456 7890 for immediate assistance.",
    });
  }
};

module.exports = { chatWithBot };

