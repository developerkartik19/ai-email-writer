const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildPrompt({ purpose, recipientType, tone, keyPoints, senderName }) {
  const toneGuidelines = {
    formal: "Use formal language, full sentences, professional salutations. Avoid contractions.",
    professional: "Balance professionalism with approachability. Confident and polished.",
    friendly: "Warm, conversational and personable. Use light contractions.",
    persuasive: "Compelling and confident. Lead with value, strong call-to-action.",
    apologetic: "Sincere, empathetic and solution-focused.",
    grateful: "Warm and genuinely appreciative.",
  };

  const toneInstruction = toneGuidelines[tone] || toneGuidelines["professional"];
  const keyPointsSection = keyPoints?.trim() ? `\nKEY POINTS TO INCLUDE:\n${keyPoints.trim()}` : "";
  const senderSection = senderName?.trim() ? `\nSIGN OFF AS: ${senderName.trim()}` : "\nSIGN OFF AS: [Your Name]";

  return `You are an elite professional email writing assistant.

Write a ${tone.toUpperCase()} email for:
PURPOSE: ${purpose}
RECIPIENT: ${recipientType}
TONE GUIDELINES: ${toneInstruction}${keyPointsSection}${senderSection}

Respond ONLY with a JSON object, no markdown, no extra text:
{"subject": "subject line here", "body": "full email body here with \\n for line breaks"}`;
}

async function generateEmail(req, res) {
  try {
    const { purpose, recipientType, tone, keyPoints, senderName } = req.body;

    if (!purpose || !recipientType || !tone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: purpose, recipientType, and tone.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt({ purpose, recipientType, tone, keyPoints, senderName });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim().replace(/```json\n?|\n?```/g, "").trim();

    let emailData;
    try {
      emailData = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ success: false, error: "AI returned unexpected format. Try again." });
    }

    if (!emailData.subject || !emailData.body) {
      return res.status(500).json({ success: false, error: "AI response incomplete. Try again." });
    }

    return res.status(200).json({
      success: true,
      data: {
        subject: emailData.subject,
        body: emailData.body,
        metadata: { purpose, recipientType, tone, generatedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate email. Please try again." });
  }
}

module.exports = { generateEmail };