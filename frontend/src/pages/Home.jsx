import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FaCheckCircle,
    FaRocket,
    FaChartLine,
    FaShieldAlt,
    FaTasks,
    FaUsers,
    FaClock,
    FaMobile,
} from "react-icons/fa";
import "./Home.css";

export default function Home() {
    const { isAuthenticated, admin } = useAuth();

    const location = useLocation();

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <FaRocket className="badge-icon" />
                        <span>Productivity Suite 2026</span>
                    </div>
                    <h1 className="hero-title">
                        Master Your Tasks,
                        <span className="gradient-text">
                            {" "}
                            Boost Productivity
                        </span>
                    </h1>
                    <p className="hero-description">
                        The ultimate task management solution that helps teams
                        and individuals organize, track, and accomplish more.
                        Join thousands of users who have transformed their
                        workflow.
                    </p>
                    <div className="hero-buttons">
                        {!isAuthenticated && (
                            <>
                                <Link
                                    to="/register"
                                    className="btn btn-primary"
                                >
                                    Get Started Free
                                    <FaRocket className="btn-icon" />
                                </Link>
                                <Link to="/login" className="btn btn-secondary">
                                    Sign In
                                </Link>
                            </>
                        )}

                        {admin && (
                            <Link to="/admin" className="btn btn-primary">
                                Go to Dashboard
                                <FaTasks className="btn-icon" />
                            </Link>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Tasks Completed</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                    </div>
                </div>
                <div className="hero-illustration">
                    <div className="floating-card card-1">
                        <FaTasks />
                        <span>Daily Tasks</span>
                    </div>
                    <div className="floating-card card-2">
                        <FaCheckCircle />
                        <span>Completed</span>
                    </div>
                    <div className="floating-card card-3">
                        <FaChartLine />
                        <span>Progress</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Why Choose Us</span>
                        <h2>Powerful Features for Modern Teams</h2>
                        <p>Everything you need to manage tasks efficiently</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaTasks />
                            </div>
                            <h3>Task Management</h3>
                            <p>
                                Create, assign, and track tasks with ease. Set
                                priorities, deadlines, and status updates.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaChartLine />
                            </div>
                            <h3>Progress Tracking</h3>
                            <p>
                                Visualize your progress with detailed analytics
                                and real-time updates.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaUsers />
                            </div>
                            <h3>Team Collaboration</h3>
                            <p>
                                Work together seamlessly with team assignments
                                and shared projects.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaClock />
                            </div>
                            <h3>Deadline Reminders</h3>
                            <p>
                                Never miss a deadline with automated
                                notifications and reminders.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaShieldAlt />
                            </div>
                            <h3>Secure & Reliable</h3>
                            <p>
                                Enterprise-grade security to protect your data
                                and privacy.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaMobile />
                            </div>
                            <h3>Mobile Friendly</h3>
                            <p>
                                Access your tasks anywhere, anytime with
                                responsive design.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Simple Process</span>
                        <h2>How Task Manager Works</h2>
                        <p>Get started in just a few simple steps</p>
                    </div>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-icon">📝</div>
                            <h3>Create Account</h3>
                            <p>
                                Sign up for free and set up your profile in
                                minutes.
                            </p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-icon">✅</div>
                            <h3>Add Tasks</h3>
                            <p>
                                Create tasks, set priorities, and assign due
                                dates.
                            </p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-icon">🚀</div>
                            <h3>Track Progress</h3>
                            <p>
                                Monitor your productivity and achieve your
                                goals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2>Loved by Users Worldwide</h2>
                        <p>See what our customers are saying</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-quote">"</div>
                            <p className="testimonial-text">
                                This task manager has completely transformed how
                                our team works. We've increased productivity by
                                40%!
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">JD</div>
                                <div className="author-info">
                                    <h4>John Doe</h4>
                                    <span>Product Manager</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-quote">"</div>
                            <p className="testimonial-text">
                                The best task management tool I've ever used.
                                Simple, intuitive, and powerful at the same
                                time.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">SM</div>
                                <div className="author-info">
                                    <h4>Sarah Miller</h4>
                                    <span>Team Lead</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-quote">"</div>
                            <p className="testimonial-text">
                                Finally found a tool that helps me stay
                                organized. The interface is beautiful and easy
                                to use.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">RK</div>
                                <div className="author-info">
                                    <h4>Raj Kumar</h4>
                                    <span>Freelancer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Boost Your Productivity?</h2>
                    <p>
                        Join thousands of users who have already transformed
                        their workflow.
                    </p>
                    {!isAuthenticated ? (
                        <Link to="/register" className="btn btn-cta">
                            Start Your Free Trial
                            <FaRocket className="btn-icon" />
                        </Link>
                    ) : (
                        <Link to="/tasks" className="btn btn-cta">
                            Go to tasks
                            <FaTasks className="btn-icon" />
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
