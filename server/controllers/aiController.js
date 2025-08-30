// server/controllers/aiController.js
const axios = require("axios");
const OLLAMA_CONFIG = require("../config/ollama");

const getAIReview = async (req, res) => {
  try {
    const { question, options, userAnswer, correctAnswer, explanation } = req.body;

    if (!userAnswer || !correctAnswer) {
      return res
        .status(400)
        .json({ error: "Both userAnswer and correctAnswer are required" });
    }

    // Check if Ollama is available
    try {
      // Test Ollama connection with timeout
      await axios.get(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.TAGS}`, {
        timeout: 5000 // 5 second timeout
      });
    } catch (ollamaError) {
      console.log("⚠️ Ollama not available, using fallback explanation");
      return getFallbackExplanation(req, res);
    }

    // Generate AI explanation using Ollama
    const aiExplanation = await generateOllamaExplanation(question, options, userAnswer, correctAnswer, explanation);
    
    return res.json({ review: aiExplanation });
  } catch (error) {
    console.error("❌ AI Review generation failed:", error.message);
    
    // Fallback to basic explanation if Ollama fails
    try {
      return getFallbackExplanation(req, res);
    } catch (fallbackError) {
      res.status(500).json({ error: "AI Review generation failed" });
    }
  }
};

const generateOllamaExplanation = async (question, options, userAnswer, correctAnswer, explanation) => {
  try {
    // Use the prompt template from config
    let prompt = OLLAMA_CONFIG.PROMPTS.APTITUDE_EXPLANATION
      .replace('{question}', question)
      .replace('{options}', options ? options.join(', ') : 'Not provided')
      .replace('{userAnswer}', userAnswer)
      .replace('{correctAnswer}', correctAnswer)
      .replace('{explanation}', explanation ? `Given Explanation: ${explanation}` : '');

    const response = await axios.post(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.GENERATE}`, {
      model: OLLAMA_CONFIG.DEFAULT_MODEL,
      prompt: prompt,
      stream: false,
      options: OLLAMA_CONFIG.GENERATION_PARAMS
    }, {
      timeout: 30000 // 30 second timeout for generation
    });

    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      throw new Error("No response from Ollama");
    }
  } catch (error) {
    console.error("❌ Ollama API error:", error.message);
    
    // Provide specific error messages based on error type
    if (error.response && error.response.status === 404) {
      throw new Error(`Model '${OLLAMA_CONFIG.DEFAULT_MODEL}' not found. Pull it with: ollama pull ${OLLAMA_CONFIG.DEFAULT_MODEL}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error(OLLAMA_CONFIG.FALLBACK_RESPONSES.CONNECTION_ERROR);
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error(OLLAMA_CONFIG.FALLBACK_RESPONSES.TIMEOUT_ERROR);
    } else {
      throw new Error(OLLAMA_CONFIG.FALLBACK_RESPONSES.MODEL_ERROR);
    }
  }
};

const buildFallbackText = ({ question, userAnswer, correctAnswer, explanation }) => {
  const base = `❌ Incorrect Answer Analysis\n\nYour Answer: ${userAnswer}\nCorrect Answer: ${correctAnswer}\n\nWhy it's wrong: Your answer doesn't match the correct solution for this problem.\n\nCorrect Approach: ${explanation || 'The correct answer requires understanding the fundamental concepts involved in this question.'}\n\nLearning Tip: Review the basic principles related to this topic and practice similar problems to strengthen your understanding.`;
  return base;
};

const getFallbackExplanation = async (req, res) => {
  const { question, userAnswer, correctAnswer, explanation } = req.body;
  const fallbackText = buildFallbackText({ question, userAnswer, correctAnswer, explanation });
  return res.json({ review: fallbackText });
};

// Batch endpoint: generate explanations for multiple wrong responses
const getAIBatchReviews = async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    let ollamaAvailable = true;
    try {
      await axios.get(`${OLLAMA_CONFIG.BASE_URL}${OLLAMA_CONFIG.ENDPOINTS.TAGS}`, { timeout: 5000 });
    } catch (e) {
      ollamaAvailable = false;
    }

    const reviews = [];
    for (const it of items) {
      const payload = {
        question: it.question || 'N/A',
        options: Array.isArray(it.options) ? it.options : [],
        userAnswer: it.userAnswer || it.selectedOption || 'N/A',
        correctAnswer: it.correctAnswer || 'N/A',
        explanation: it.explanation || ''
      };

      if (!ollamaAvailable) {
        reviews.push(buildFallbackText(payload));
        continue;
      }

      try {
        const text = await generateOllamaExplanation(
          payload.question,
          payload.options,
          payload.userAnswer,
          payload.correctAnswer,
          payload.explanation
        );
        reviews.push(text);
      } catch (err) {
        reviews.push(buildFallbackText(payload));
      }
    }

    return res.json({ reviews });
  } catch (error) {
    console.error('❌ Batch AI Review generation failed:', error.message);
    return res.status(500).json({ error: 'Batch AI Review generation failed' });
  }
};

module.exports = { getAIReview, getAIBatchReviews };
