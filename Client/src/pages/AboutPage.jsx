import { useState } from 'react'
import '../App.css'

function About() {
    const features = [
        {
            title: "Real-time Analysis",
            description: "Get instant feedback on your message's emotional tone",
            icon: "⚡"
        },
        {
            title: "Smart Insights",
            description: "Understand how your words might be perceived by others",
            icon: "🧠"
        },
        {
            title: "Better Communication",
            description: "Improve your messaging for clearer, more empathetic conversations",
            icon: "💬"
        }
    ];

    return (
        <div className="about-page">
            <div className="about-header">
                <h1>About VibeChecker</h1>
                <p className="about-subtitle">Empowering better communication through emotional intelligence</p>
            </div>
            
            <div className="about-content">
                <section className="mission-section">
                    <h2>Our Mission</h2>
                    <p>We are <strong>The ReActivators</strong>, a passionate team dedicated to revolutionizing digital communication. Our mission is to help users better understand the emotional tone of their messages, enabling clearer, more empathetic communication in our increasingly connected world.</p>
                    <p>We believe that understanding the emotional impact of our words is crucial for building stronger relationships, whether in personal conversations, professional communications, or social interactions.</p>
                </section>

                <section className="features-section">
                    <h2>What We Offer</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="values-section">
                    <h2>Our Values</h2>
                    <div className="values-list">
                        <div className="value-item">
                            <strong>Collaboration</strong> - We believe in the power of working together to create meaningful solutions.
                        </div>
                        <div className="value-item">
                            <strong>Creativity</strong> - We embrace innovative approaches to solve complex communication challenges.
                        </div>
                        <div className="value-item">
                            <strong>Continuous Learning</strong> - We are committed to constantly improving and evolving our understanding.
                        </div>
                        <div className="value-item">
                            <strong>Empathy</strong> - We prioritize understanding and connecting with the human experience.
                        </div>
                    </div>
                </section>
            </div>
            
            <div className="about-footer">
                <p>Thank you for visiting our project. We hope you enjoy using VibeChecker as much as we enjoyed building it!</p>
            </div>
        </div>
    );
}

export default About