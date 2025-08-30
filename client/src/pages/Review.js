// === Review.jsx (Floating UI, No Dark Mode / No PDF) ===
import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Form,
  Modal,
  Spinner,
  ProgressBar
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Review.css';

function Review() {
  const [trackData, setTrackData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // AI states
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  useEffect(() => {
    const fetchTrackData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/tracking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrackData(res.data || []);
      } catch (err) {
        console.error('Failed to fetch tracking data:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Something went wrong while fetching data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
  }, [navigate]);

  // Derived lists
  const allTopics = useMemo(() => (
    trackData.length > 0 ? ['All', ...new Set(trackData.map((item) => item.topic))] : ['All']
  ), [trackData]);

  const allDates = useMemo(() => (
    trackData.length > 0 ? ['All', ...new Set(
      trackData.map((item) => new Date(item.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }))
    )] : ['All']
  ), [trackData]);

  // Filtering + search
  useEffect(() => {
    let filtered = [...(trackData || [])];

    if (selectedTopic !== 'All') {
      filtered = filtered.filter((item) => item.topic === selectedTopic);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter((item) => {
        const itemDifficulty = item.difficulty || 'medium';
        return itemDifficulty === selectedDifficulty;
      });
    }

    if (selectedDate !== 'All') {
      filtered = filtered.filter((item) => {
        const localDate = new Date(item.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        return localDate === selectedDate;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.map((attempt) => ({
        ...attempt,
        responses: (attempt.responses || []).filter(r =>
          (r.question || '').toLowerCase().includes(q) ||
          (r.selectedOption || '').toLowerCase().includes(q) ||
          (r.correctAnswer || '').toLowerCase().includes(q)
        )
      })).filter(a => (a.responses || []).length > 0 || !search.trim());
    }

    setFilteredData(filtered);
  }, [trackData, selectedTopic, selectedDifficulty, selectedDate, search]);

  const formatIST = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  // ===== AI Functions (same as before) =====
  const buildLocalFallback = (res) => {
    const userAnswer = res?.selectedOption ?? 'N/A';
    const correctAnswer = res?.correctAnswer ?? 'N/A';
    const explanation = res?.explanation && res.explanation !== 'N/A' ? res.explanation : '';
    return `❌ Incorrect Answer Analysis\n\nYour Answer: ${userAnswer}\nCorrect Answer: ${correctAnswer}\n\nWhy it's wrong: Your answer doesn't match the correct solution.\n\nCorrect Approach: ${explanation || 'Review the core concept for this question.'}`;
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const getAIExplanation = async (res) => {
    openModal();
    setAiLoading(true);
    setAiExplanation('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/review',
        {
          question: res.question,
          options: res.options || [],
          correctAnswer: res.correctAnswer,
          userAnswer: res.selectedOption,
          explanation: res.explanation || ''
        },
        { timeout: 12000 }
      );

      const text = (response?.data?.review ?? '').toString();
      if (!text.trim() || text.trim().length < 10) {
        setAiExplanation(buildLocalFallback(res));
      } else {
        setAiExplanation(text);
      }
    } catch (error) {
      console.error('AI Review fetch failed:', error?.message || error);
      setAiExplanation(buildLocalFallback(res));
    }

    setAiLoading(false);
  };

  const getBatchAIExplanations = async (attempt) => {
    const wrong = (attempt?.responses || []).filter((r) => !r.isCorrect);
    if (wrong.length === 0) {
      toast.info('No wrong answers in this attempt.');
      return;
    }

    openModal();
    setAiLoading(true);
    setAiExplanation('');

    const items = wrong.map((r) => ({
      question: r.question,
      options: r.options || [],
      userAnswer: r.selectedOption,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation || ''
    }));

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/reviews/batch',
        { items },
        { timeout: Math.max(20000, wrong.length * 12000) }
      );
      const reviews = Array.isArray(response?.data?.reviews) ? response.data.reviews : [];

      if (!reviews.length) {
        const combined = wrong
          .map((r, i) => `Q${i + 1}. ${r.question}\n\n${buildLocalFallback(r)}`)
          .join('\n\n-----------------------------\n\n');
        setAiExplanation(combined);
      } else {
        const combined = reviews
          .map((txt, i) => {
            const header = `Q${i + 1}. ${wrong[i]?.question || ''}`;
            const body = (txt || '').toString().trim();
            return `${header}\n\n${body || buildLocalFallback(wrong[i])}`;
          })
          .join('\n\n-----------------------------\n\n');
        setAiExplanation(combined);
      }
    } catch (error) {
      console.error('Batch AI Review fetch failed:', error?.message || error);
      const combined = wrong
        .map((r, i) => `Q${i + 1}. ${r.question}\n\n${buildLocalFallback(r)}`)
        .join('\n\n-----------------------------\n\n');
      setAiExplanation(combined);
    }

    setAiLoading(false);
  };

  const totalAttempts = filteredData.length;
  const totals = useMemo(() => {
    let correct = 0, total = 0;
    filteredData.forEach(a => {
      (a.responses || []).forEach(r => {
        total += 1; if (r.isCorrect) correct += 1;
      });
    });
    return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0 };
  }, [filteredData]);

  return (
    <div className="review-bg">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Floating Hero */}
      <div className="review-hero floating">
        <Container>
          <div className="review-hero-inner">
            <div>
              <h2 className="mb-1">📝 Review Center</h2>
              <p className="mb-0 text-muted-2">Filter attempts and get instant AI tutoring.</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
                ⬅️ Back
              </Button>
            </div>
          </div>

          <Row className="g-3 mt-2">
            <Col lg={3} sm={6}>
              <Card className="kpi-card floating">
                <Card.Body>
                  <div className="kpi-label">Attempts</div>
                  <div className="kpi-value">{totalAttempts}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} sm={6}>
              <Card className="kpi-card floating">
                <Card.Body>
                  <div className="kpi-label">Questions</div>
                  <div className="kpi-value">{totals.total}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} sm={6}>
              <Card className="kpi-card floating">
                <Card.Body>
                  <div className="kpi-label">Correct</div>
                  <div className="kpi-value text-success">{totals.correct}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} sm={6}>
              <Card className="kpi-card shadow-sm">
  <Card.Body>
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="kpi-label">Accuracy</div>
      <span className="kpi-chip">{totals.pct}%</span>
    </div>
    <ProgressBar 
  now={totals.pct} 
  animated 
  className="kpi-progress"
/>

  </Card.Body>
</Card>

            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Card className="filter-card floating shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Label className="fw-semibold">📚 Topic</Form.Label>
                <Form.Select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                  {allTopics.map((topic, idx) => (
                    <option key={idx} value={topic}>{topic}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-semibold">🎯 Difficulty</Form.Label>
                <Form.Select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                  <option value="All">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-semibold">📅 Date</Form.Label>
                <Form.Select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                  {allDates.map((date, idx) => (
                    <option key={idx} value={date}>{date}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-semibold">🔎 Search</Form.Label>
                <Form.Control
                  placeholder="Question / your answer / correct answer"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Attempts */}
        <div className="mt-4">
          {loading ? (
            <Card className="skeleton-card floating">
              <Card.Body>
                <div className="skeleton-line w-25" />
                <div className="skeleton-line w-75 mt-2" />
                <div className="skeleton-table mt-4" />
              </Card.Body>
            </Card>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : filteredData.length === 0 ? (
            <Card className="empty-card floating text-center p-4">
              <Card.Body>
                <div className="empty-emoji mb-2">🧐</div>
                <h5 className="mb-1">No matching records</h5>
                <p className="text-muted mb-0">Try changing filters or clearing the search box.</p>
              </Card.Body>
            </Card>
          ) : (
            filteredData.map((attempt, index) => (
              <Card className="attempt-card floating shadow-sm" key={index}>
                <Card.Body>
                  <div className="attempt-header">
                    <div>
                      <div className="review-date-time">
                        <span className="icon">📅</span> {formatIST(attempt.date)}
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                        <Badge bg="info" className="review-badge">{attempt.topic}</Badge>
                        <Badge bg="warning" text="dark" className="review-badge">
                          {(attempt.difficulty || 'medium').charAt(0).toUpperCase() + (attempt.difficulty || 'medium').slice(1)}
                        </Badge>
                        <Badge bg="success" className="review-badge">Score: {attempt.score}/{attempt.total}</Badge>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => getBatchAIExplanations(attempt)}>
                        🤖 Explain All Wrong
                      </Button>
                    </div>
                  </div>

                  <div className="table-responsive mt-3">
                    <Table bordered hover className="review-table align-middle">
                      <thead>
                        <tr>
                          <th className="text-center">#</th>
                          <th>Question</th>
                          <th>Your Answer</th>
                          <th>Correct Answer</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(attempt.responses || []).map((res, idx) => (
                          <tr key={idx} className={!res.isCorrect ? 'row-wrong' : ''}>
                            <td className="text-center">{idx + 1}</td>
                            <td style={{minWidth: 260}}>{res.question}</td>
                            <td className="text-primary">{res.selectedOption}</td>
                            <td className="text-success">{res.correctAnswer}</td>
                            <td className="text-center">
                              <Badge bg={res.isCorrect ? 'success' : 'danger'} className="review-badge">
                                {res.isCorrect ? 'Correct' : 'Wrong'}
                              </Badge>
                            </td>
                            <td className="text-center">
                              {!res.isCorrect ? (
                                <Button size="sm" variant="outline-secondary" onClick={() => getAIExplanation(res)}>
                                  AI Explain
                                </Button>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>

        {/* AI Modal */}
        <Modal show={showModal} onHide={closeModal} centered size="lg" backdrop="static">
          <Modal.Header closeButton className="ai-header">
            <Modal.Title>🤖 AI Tutor</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {aiLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" />
                <p className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>Generating explanation…</p>
              </div>
            ) : (
              <div className="ai-explanation">
                <div className="explanation-header mb-3">
                  <h6 className="text-secondary mb-2">Understanding Your Mistake</h6>
                  <div className="alert alert-info mb-0">
                    {aiExplanation?.includes('Question:')
                      ? 'Detailed answer below.'
                      : 'Review the explanation to see how to fix mistakes.'}
                  </div>
                </div>
                <div className="explanation-content">
                  {aiExplanation ? (
                    aiExplanation.includes('Question:') ? (
                      <pre className="explanation-pre">{aiExplanation}</pre>
                    ) : (
                      <div className="explanation-text">{aiExplanation}</div>
                    )
                  ) : (
                    <div className="text-muted" style={{ fontSize: '0.95rem' }}>No explanation yet.</div>
                  )}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Close</Button>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(aiExplanation || '');
                  toast.success('📋 Explanation copied!');
                } catch {
                  toast.error('❌ Failed to copy');
                }
              }}
              disabled={!aiExplanation}
            >
              📋 Copy
            </Button>
          </Modal.Footer> 
          </Modal>
      </Container>
    </div>
  );
}

export default Review;