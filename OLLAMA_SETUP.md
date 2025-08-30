# 🤖 Ollama AI Integration Setup Guide

This guide will help you set up Ollama AI to provide intelligent explanations for wrong answers in the AptiTrack application.

## 📋 Prerequisites

- Windows 10/11, macOS, or Linux
- At least 4GB RAM (8GB+ recommended)
- 5GB+ free disk space
- Node.js and npm (already installed for AptiTrack)

## 🚀 Installation Steps

### 1. Install Ollama

#### Windows (WSL2 recommended)
```bash
# Install WSL2 if you haven't already
wsl --install

# Install Ollama in WSL2
curl -fsSL https://ollama.ai/install.sh | sh
```

#### macOS
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.ai/download
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service

```bash
# Start the Ollama service
ollama serve

# Keep this terminal open - Ollama runs as a background service
```

### 3. Download AI Models

```bash
# Download the default model (llama2)
ollama pull llama2

# Alternative models you can try:
ollama pull llama2:7b      # Smaller, faster
ollama pull llama2:13b     # Larger, more capable
ollama pull mistral         # Good for educational content
ollama pull codellama       # Good for mathematical problems
```

### 4. Test Ollama

```bash
# Test if Ollama is working
ollama run llama2 "Hello, can you help me with math?"

# Check available models
ollama list
```

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in your server directory:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Model Selection

Edit `server/config/ollama.js` to change the default model:

```javascript
DEFAULT_MODEL: process.env.OLLAMA_MODEL || 'llama2',
```

## 🔧 Troubleshooting

### Common Issues

1. **Ollama not starting**
   ```bash
   # Check if port 11434 is available
   netstat -an | grep 11434
   
   # Kill any existing process
   pkill ollama
   
   # Restart Ollama
   ollama serve
   ```

2. **Model download fails**
   ```bash
   # Check internet connection
   # Try downloading a smaller model first
   ollama pull llama2:7b
   ```

3. **Out of memory errors**
   ```bash
   # Use a smaller model
   ollama pull llama2:7b
   
   # Or increase swap space on Linux
   ```

### Performance Optimization

- **For faster responses**: Use `llama2:7b` or `mistral:7b`
- **For better quality**: Use `llama2:13b` or `codellama:13b`
- **For mathematical problems**: Use `codellama` models

## 📱 Usage in AptiTrack

1. **Start your AptiTrack server**
   ```bash
   cd server
   npm start
   ```

2. **Start Ollama service**
   ```bash
   ollama serve
   ```

3. **Take a quiz and get wrong answers**

4. **Click "❓ Get AI Explanation" in the Review page**

5. **Enjoy intelligent, personalized explanations!**

## 🎯 Features

- **Smart Explanations**: AI analyzes your wrong answer and explains why it's incorrect
- **Step-by-step Solutions**: Clear breakdown of the correct approach
- **Learning Tips**: Helpful advice for similar problems
- **Fallback Support**: Basic explanations when AI is unavailable
- **Configurable**: Easy to customize models and parameters

## 🔒 Security Notes

- Ollama runs locally on your machine
- No data is sent to external servers
- All explanations are generated locally
- Your quiz data remains private

## 📚 Model Recommendations

| Use Case | Recommended Model | Size | Speed | Quality |
|----------|------------------|------|-------|---------|
| **General Learning** | `llama2` | 7B | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| **Fast Responses** | `llama2:7b` | 7B | ⚡⚡⚡⚡ | ⭐⭐⭐ |
| **Best Quality** | `llama2:13b` | 13B | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| **Math Problems** | `codellama:7b` | 7B | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| **Educational Content** | `mistral:7b` | 7B | ⚡⚡⚡ | ⭐⭐⭐⭐ |

## 🆘 Support

If you encounter issues:

1. Check the console logs in your AptiTrack server
2. Verify Ollama is running: `ollama list`
3. Test Ollama directly: `ollama run llama2 "test"`
4. Check the [Ollama documentation](https://ollama.ai/docs)

---

**Happy Learning with AI! 🎓🤖**




