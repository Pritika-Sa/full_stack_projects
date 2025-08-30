import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { Save } from "react-bootstrap-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("⚠️ You are not logged in. Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        toast.error("❌ Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/auth/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="profile-bg">
      <Container className="position-relative">
        {loading ? (
          <Card className="shadow p-4 text-center profile-card mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading profile...</p>
          </Card>
        ) : profile ? (
          <Card className="profile-card p-4 shadow-lg mt-5">
            <div className="text-center mb-4">
              {/* Avatar removed */}
              <h3 className="mt-2 fw-bold">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-muted">{profile.email}</p>
            </div>

            <Row className="g-4">
              {/* Personal Info */}
              <Col md={6}>
                <Card className="inner-card p-3 h-100">
                  <h5 className="section-title">Personal Info</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      name="firstName"
                      value={profile.firstName || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      name="lastName"
                      value={profile.lastName || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={profile.dob?.slice(0, 10) || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      name="age"
                      value={profile.age || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Card>
              </Col>

              {/* Academic Info */}
              <Col md={6}>
                <Card className="inner-card p-3 h-100">
                  <h5 className="section-title">Academic & Location</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Field of Study</Form.Label>
                    <Form.Control
                      name="study"
                      value={profile.study || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      name="location"
                      value={profile.location || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Card>
              </Col>
            </Row>

            {/* Save & Back Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-4">
  <Button variant="secondary" className="back-btn" onClick={handleBack}>
    ⬅ Back
  </Button>
  <Button className="save-btn" onClick={handleSave}>
    <Save className="me-2" />
    Save Changes
  </Button>
</div>

          </Card>
        ) : (
          <Card className="shadow p-4 text-center profile-card mt-5">
            <p>No profile found.</p>
          </Card>
        )}

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </Container>
    </div>
  );
}

export default Profile;
