import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false); // state to toggle password
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('track');
      localStorage.removeItem('results');

      toast.success('Login successful! Redirecting...', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
      });

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || '❌ Invalid email or password');
    }
  };

  return (
    <div className="register-wrapper">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="register-card shadow-lg">
          <Row className="g-0">
            {/* Left Illustration */}
            <Col md={5} className="register-left d-none d-md-flex align-items-center justify-content-center">
              <div className="text-center px-3">
                <h3 className="text-primary fw-bold">Welcome Back!</h3>
                <p className="text-muted">Login to continue your journey 🚀</p>
                <img
                  src="https://illustrations.popsy.co/violet/team-idea.svg"
                  alt="illustration"
                  className="img-fluid mt-3"
                />
              </div>
            </Col>

            {/* Right Form */}
            <Col md={7} className="p-4">
              <h2 className="text-center fw-bold mb-4">Login</h2>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              <h6>EMAIL:</h6>
              <Form onSubmit={handleSubmit}>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-3"
                />
                <h6>PASSWORD:</h6>
                <div className="position-relative mb-3">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="d-grid mb-3">
                  <Button type="submit" className="register-btn">
                    Login
                  </Button>
                </div>

                <div className="text-center mt-3">
                  Don’t have an account? <a href="/register">Register here</a>
                </div>
              </Form>
            </Col>
          </Row>
        </Card>

        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
