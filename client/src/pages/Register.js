import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    study: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords don't match");
      return;
    }

    const age = calculateAge(formData.dob);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        age,
        study: formData.study,
        location: formData.location,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Registered successfully! Redirecting...', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      toast.error(`❌ Registration failed: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="register-wrapper">
      <Container className="d-flex justify-content-center align-items-center">
        <Card className="register-card shadow-lg">
          <Row className="g-0">
            {/* Left Illustration */}
            <Col md={5} className="register-left d-none d-md-flex align-items-center justify-content-center">
              <div className="text-center px-3">
                <h3 className="text-primary fw-bold">Join AptiTrack!</h3>
                <p className="text-muted">Boost your aptitude skills and track your progress 🚀</p>
                <img
                  src="https://illustrations.popsy.co/violet/team-idea.svg"
                  alt="illustration"
                  className="img-fluid mt-3"
                />
              </div>
            </Col>

            {/* Right Form */}
            <Col md={7} className="p-4">
              <h2 className="text-center fw-bold mb-4">Create an Account</h2>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="form-control-custom mb-2"
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="form-control-custom mb-2"
                    />
                  </Col>
                </Row>

                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-2"
                />

                <Form.Control
                  type="text"
                  placeholder="Field of Study"
                  name="study"
                  value={formData.study}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-2"
                />

                <Form.Control
                  type="text"
                  placeholder="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-3"
                />

                <Form.Control
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-2"
                />

                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-2"
                />

                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-control-custom mb-3"
                />

                <div className="d-grid">
                  <Button type="submit" className="register-btn">
                    Register
                  </Button>
                </div>

                <div className="text-center mt-3">
                  Already have an account? <a href="/login">Login</a>
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

export default Register;
