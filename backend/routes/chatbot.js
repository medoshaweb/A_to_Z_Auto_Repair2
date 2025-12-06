const express = require("express");
const router = express.Router();
const { chatWithBot } = require("../controllers/chatbotController");

// Chat with AI assistant
router.post("/chat", chatWithBot);

module.exports = router;

