import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Quiz.css";

function Quiz() {
  const { state } = useLocation();
  const { questions = [], topic = "", difficulty = "medium" } = state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!questions.length) {
    return (
      <div className="quiz-container">
        <div className="quiz-card empty">
          <p>⚠️ No questions found!</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const allAnswered = answers.every((ans) => ans !== null);
  const optionLabels = ["A", "B", "C", "D"];

  const handleSelect = (optionIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = optionIndex;
    setAnswers(updatedAnswers);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (!allAnswered) {
      setShowWarning(true);
      return;
    }

    const responses = questions.map((q, idx) => {
      const chosenOption = q.options?.[answers[idx]] || "N/A";
      const correctAnswer = q.answer || "N/A";
      return {
        question: q.question,
        selectedOption: chosenOption,
        correctAnswer,
        isCorrect: chosenOption === correctAnswer,
        explanation: q.explanation || "N/A",
      };
    });

    const score = responses.filter((r) => r.isCorrect).length;
    const resultData = {
      topic,
      difficulty,
      score,
      total: questions.length,
      time: timeElapsed,
      date: new Date().toISOString(),
      responses,
    };

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "http://localhost:5000/api/tracking",
          { ...resultData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("❌ Tracking data not saved:", err.response?.data || err.message);
      }
    }

    const storedResults = JSON.parse(localStorage.getItem("results") || "[]");
    localStorage.setItem("results", JSON.stringify([...storedResults, resultData]));

    navigate("/result", { state: resultData });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-info">
            <span>{topic.replace(/([A-Z])/g, " $1").trim()}</span>
            <span>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </div>
          <div className="quiz-timer">⏱ {formatTime(timeElapsed)}</div>
        </div>

        {/* Question */}
        <h2 className="quiz-question">{`Q${currentIndex + 1}. ${currentQuestion.question}`}</h2>

        {/* Options */}
        <div className="quiz-options">
          {currentQuestion.options.map((opt, idx) => (
            <div
              key={idx}
              className={`quiz-option ${answers[currentIndex] === idx ? "selected" : ""}`}
              onClick={() => handleSelect(idx)}
            >
              <span className="option-label">{optionLabels[idx]}</span>
              {opt}
            </div>
          ))}
        </div>
          
        {/* Navigation */}
        <div className="quiz-nav">
          {currentIndex > 0 && (
            <button className="quiz-btn prev" onClick={handlePrev}>
              Previous
            </button>
          )}
          <button className="quiz-btn next" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="quiz-warning-overlay">
          <div className="quiz-warning-box">
            <p>⚠️ Please answer all questions before finishing!</p>
            <button onClick={() => setShowWarning(false)} className="quiz-btn">
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
