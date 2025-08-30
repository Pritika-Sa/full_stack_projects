import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAptiQuestions } from "../requests";
import "./Practice.css";

function Practice() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const topicCategories = {
    "Basic Math": ["Age", "Calendar", "SimpleInterest"],
    "Advanced Math": [
      "MixtureAndAlligation",
      "PermutationAndCombination",
      "PipesAndCistern",
    ],
    "Business Math": ["ProfitAndLoss"],
    Physics: ["SpeedTimeDistance"],
    Mixed: ["Random"],
  };

  const difficultyLevels = [
    {
      value: "easy",
      label: "Easy",
      description: "Basic concepts, simple calculations",
    },
    {
      value: "medium",
      label: "Medium",
      description: "Standard problems, moderate complexity",
    },
    {
      value: "hard",
      label: "Hard",
      description: "Advanced concepts, complex scenarios",
    },
  ];

  const handleStart = async () => {
    if (!selectedTopic) {
      setError("Please select a topic");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const requests = Array.from({ length: numQuestions }, () =>
        getAptiQuestions(selectedTopic, selectedDifficulty)
      );

      const results = await Promise.all(requests);
      const allQuestions = results.flat();

      navigate("/quiz", {
        state: {
          questions: allQuestions,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
        },
      });
    } catch (err) {
      console.error("❌ API Error:", err);
      setError("Failed to fetch questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTopicDisplayName = (topic) => {
    return topic.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="practice-bg">
      <div className="practice-container">
        <h2 className="practice-title">🚀 Aptitude Practice</h2>
        <p className="practice-subtitle">
          "Small steps every day lead to big results."
        </p>

        {error && <div className="error-msg">{error}</div>}

        {/* Topic Selection */}
        <div className="form-group">
          <label className="form-label">Choose Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="styled-select"
          >
            <option value="">-- Select Topic --</option>
            {Object.entries(topicCategories).map(
              ([category, categoryTopics]) => (
                <optgroup key={category} label={category}>
                  {categoryTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {getTopicDisplayName(topic)}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="form-group">
          <label className="form-label">Choose Difficulty</label>
          <div className="difficulty-grid">
            {difficultyLevels.map((level) => (
              <div
                key={level.value}
                className={`difficulty-card ${
                  selectedDifficulty === level.value ? "active" : ""
                }`}
                onClick={() => setSelectedDifficulty(level.value)}
              >
                <h5>{level.label}</h5>
                <p>{level.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="form-group">
          <label className="form-label">Number of Questions</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="styled-select"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          className="start-btn"
          onClick={handleStart}
          disabled={loading || !selectedTopic}
        >
          {loading ? "Loading..." : "🚀 Start Practice"}
        </button>
      </div>
    </div>
  );
}

export default Practice;
