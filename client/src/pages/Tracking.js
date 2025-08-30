import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  AreaChart, Area, ResponsiveContainer, CartesianGrid, Legend, LabelList
} from 'recharts';
import axios from 'axios';
import './Tracking.css';

const COLORS = ['#14b8a6', '#f97316'];

function Tracking() {
  const [data, setData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCharts, setSelectedCharts] = useState({ bar: true, pie: true, area: true });
  const ref = useRef();

  useEffect(() => {
    const fetchTrackingData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/tracking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
      }
    };
    fetchTrackingData();
  }, []);

  useEffect(() => {
    if (data.length) {
      const topicMap = {};
      const dailyMap = {};
      const timeArray = [];
      let correct = 0, wrong = 0;

      data.forEach(entry => {
        const { topic, difficulty, score, total, date, responses, time } = entry;
        const entryDate = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
        const normalizedDifficulty = difficulty || 'medium';

        if (
          (!filterTopic || topic === filterTopic) &&
          (!filterDifficulty || normalizedDifficulty === filterDifficulty) &&
          (!selectedDate || entryDate === selectedDate)
        ) {
          topicMap[topic] = topicMap[topic] || { topic, score: 0, total: 0 };
          topicMap[topic].score += score;
          topicMap[topic].total += total;

          const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
          dailyMap[formattedDate] = (dailyMap[formattedDate] || 0) + 1;

          responses.forEach(res => res.isCorrect ? correct++ : wrong++);

          if (typeof time === 'number') timeArray.push(time);
        }
      });

      setBarData(Object.values(topicMap).map(e => ({
        ...e,
        percentage: ((e.score / e.total) * 100).toFixed(1)
      })));

      setPieData([
        { name: 'Correct', value: correct },
        { name: 'Wrong', value: wrong }
      ]);

      const sortedArea = Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setAreaData(sortedArea);
      setTimeData(timeArray);
    }
  }, [data, filterTopic, filterDifficulty, selectedDate]);

  const uniqueTopics = data.length > 0 ? [...new Set(data.map(d => d.topic))] : [];
  const uniqueDifficulties = data.length > 0 ? [...new Set(data.map(d => d.difficulty || 'medium'))] : ['easy', 'medium', 'hard'];

  const handleChartToggle = (chart) => {
    setSelectedCharts(prev => ({ ...prev, [chart]: !prev[chart] }));
  };

  const avgTime = timeData.length ? (timeData.reduce((a, b) => a + b, 0) / timeData.length).toFixed(1) : null;

  return (
    <div className="tracking-bg py-5">
      <Container className="fade-in">
        <div className="tracking-header text-center mb-4">
          <h2 className="fw-bold teal-text">Aptitude Tracking Dashboard</h2>
          <p className="text-muted">Visualize your progress and performance over time</p>
        </div>

        {/* Filters */}
        <Row className="g-3 mb-4 filter-section">
          <Col md={3}>
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <label className="form-label">Topic</label>
            <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="form-select">
              <option value=''>All Topics</option>
              {uniqueTopics.map((t, idx) => (
                <option key={idx} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>
              ))}
            </select>
          </Col>
          <Col md={3}>
            <label className="form-label">Difficulty</label>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="form-select">
              <option value=''>All Levels</option>
              {uniqueDifficulties.map((d, idx) => (
                <option key={idx} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </Col>
          <Col md={3}>
            <label className="form-label">Show Charts</label>
            <div className="d-flex gap-3 flex-wrap">
              {['bar', 'pie', 'area'].map(chart => (
                <div key={chart} className="form-check">
                  <input type="checkbox" id={chart} checked={selectedCharts[chart]} onChange={() => handleChartToggle(chart)} className="form-check-input" />
                  <label htmlFor={chart} className="form-check-label">{chart.toUpperCase()}</label>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {/* Charts Section */}
        <div id="pdf-export" ref={ref}>
          {selectedCharts.bar && (
            <div className="chart-card shadow-lg rounded-4 p-3">
              <h5 className="chart-title">Topic-wise Accuracy</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="topic" tick={{ fill: '#1e293b', fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#1e293b', fontWeight: 600 }} />
                  <Tooltip wrapperStyle={{ fontSize: '0.85rem', backgroundColor: '#ffffff' }} />
                  <Legend />
                  <Bar dataKey="score" name="Score" fill="#0f766e">
                    <LabelList dataKey="percentage" position="top" style={{ fill: '#0f172a', fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
<br></br>
          {selectedCharts.pie && (
            <div className="chart-card shadow-lg rounded-4 p-3">
              <h5 className="chart-title">Overall Accuracy</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
<br></br>
          {selectedCharts.area && (
            <div className="chart-card shadow-lg rounded-4 p-3">
              <h5 className="chart-title">Attempts Per Day</h5>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={areaData}>
                  <XAxis dataKey="date" tick={{ fill: '#1e293b', fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#1e293b', fontWeight: 600 }} />
                  <CartesianGrid stroke="#e2e8f0" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" name="Attempts" stroke="#3b82f6" fill="#bfdbfe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
<br></br>
          {avgTime && (
            <div className="chart-card text-center shadow-sm p-3 rounded-4">
              <h6 className="text-muted">⏱ Average Time Taken Per Quiz: <strong>{(avgTime / 60).toFixed(2)} mins</strong></h6>
            </div>
          )}
        </div>

        {/* Back button */}
        <Row className="mt-4 justify-content-center">
  <Col xs="auto">
    <button 
      className="back-btn" 
      onClick={() => window.location.href = '/dashboard'}
    >
      Back to Dashboard
    </button>
  </Col>
</Row>

      </Container>
    </div>
  );
}

export default Tracking;
