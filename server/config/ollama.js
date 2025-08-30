// server/config/ollama.js
// Configuration file for Ollama AI integration

const OLLAMA_CONFIG = {
  // Ollama server URL (default: localhost:11434)
  BASE_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  
  // Default model to use (change this to any model you have installed)
  DEFAULT_MODEL: process.env.OLLAMA_MODEL || 'llama2',
  
  // Alternative models you can use:
  // - 'llama2' - Good balance of performance and quality
  // - 'llama2:7b' - Smaller, faster model
  // - 'llama2:13b' - Larger, more capable model
  // - 'mistral' - Good for educational content
  // - 'codellama' - Good for mathematical problems
  
  // API endpoints
  ENDPOINTS: {
    GENERATE: '/api/generate',
    TAGS: '/api/tags',
    LIST: '/api/list'
  },
  
  // Generation parameters
  GENERATION_PARAMS: {
    temperature: 0.7,        // Controls randomness (0.0 = deterministic, 1.0 = very random)
    top_p: 0.9,             // Nucleus sampling parameter
    max_tokens: 500,         // Maximum length of response
    top_k: 40,              // Top-k sampling
    repeat_penalty: 1.1,    // Penalty for repeating tokens
    stop: ['\n\n', '###']   // Stop generation at these tokens
  },
  
  // Prompt templates
  PROMPTS: {
    APTITUDE_EXPLANATION: `You are an expert aptitude tutor. A student got this question wrong and needs help understanding why.

Question: {question}

Options: {options}

Student's Answer: {userAnswer}
Correct Answer: {correctAnswer}
{explanation}

Please provide a clear, step-by-step explanation that:
1. Acknowledges the student's answer
2. Explains why their answer is incorrect
3. Shows the correct approach to solve this problem
4. Provides the correct answer with reasoning
5. Gives a helpful tip for similar questions

Keep the explanation friendly, encouraging, and educational. Format it clearly with bullet points or numbered steps.`
  },
  
  // Fallback responses when Ollama is not available
  FALLBACK_RESPONSES: {
    CONNECTION_ERROR: "⚠️ Ollama AI service is currently unavailable. Please try again later or contact support.",
    MODEL_ERROR: "⚠️ The AI model is experiencing issues. Please try again or use the basic explanation.",
    TIMEOUT_ERROR: "⚠️ The AI response is taking too long. Please try again or use the basic explanation."
  }
};

module.exports = OLLAMA_CONFIG;




