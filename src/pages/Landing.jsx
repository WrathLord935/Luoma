import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, ShoppingBag, ArrowRight, Instagram, Twitter } from 'lucide-react';
import Button from '../components/Button';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <header className="landing-header container">
                <div className="brand-logo">LOOMA</div>
                <div className="landing-nav">
                    <Button variant="outline" onClick={() => navigate('/auth?mode=signin')}>Sign In</Button>
                    <Button onClick={() => navigate('/auth?mode=signup')}>Join Movement</Button>
                </div>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="landing-hero container">
                    <div className="hero-content">
                        <div className="hero-badge">Bit-Sized Fashion, Byte-Sized Impact</div>
                        <h1 className="hero-title animate-fade-up">
                            WEAR IT.<br />
                            <span className="highlight-text">CLONE IT.</span><br />
                            OWN IT.
                        </h1>
                        <p className="hero-subtitle animate-fade-up delay-100">
                            The first Gen Z marketplace where digital swag meets physical drips.
                            Trade, upcycle, and flex your sustainable fits.
                        </p>
                        <div className="cta-group animate-fade-up delay-200">
                            <Button variant="primary" size="lg" onClick={() => navigate('/auth?mode=signup')}>
                                Start Swapping <ArrowRight size={20} />
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => navigate('/leaderboards')}>
                                View Leaderboard
                            </Button>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-scale delay-300">
                        <div className="visual-card card-1">
                            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80" alt="Fashion Item" />
                        </div>
                        <div className="visual-card card-2">
                            <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80" alt="Fashion Item" />
                        </div>
                        <div className="floating-badge">
                            <span>🔥</span> 12k+ Swaps
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="features-section">
                    <div className="container">
                        <h2 className="section-title">THE LOOMA LOOP</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon bg-accent">
                                    <Camera size={32} />
                                </div>
                                <h3>Snap & Flex</h3>
                                <p>Upload your pre-loved gems. Add a story, set the vibe, and put it on the block.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon bg-primary">
                                    <RefreshCw size={32} color="white" />
                                </div>
                                <h3>Swap or Drop</h3>
                                <p>Trade with peers or sell for credits. Keep the materials in motion, not in landfills.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon bg-secondary">
                                    <ShoppingBag size={32} color="white" />
                                </div>
                                <h3>Copp New Drip</h3>
                                <p>Use your credits to snag unique pieces from the community. Sustainable never looked this good.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRENDING MARQUEE */}
                <section className="trending-section">
                    <div className="marquee-wrapper">
                        <div className="marquee-content">
                            <span>VINTAGE TEES • Y2K JEANS • UPCYCLED DENIM • STREETWEAR •</span>
                            <span>VINTAGE TEES • Y2K JEANS • UPCYCLED DENIM • STREETWEAR •</span>
                            <span>VINTAGE TEES • Y2K JEANS • UPCYCLED DENIM • STREETWEAR •</span>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="landing-footer container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h2>LOOMA</h2>
                            <p>© 2026 Looma Inc. All rights reserved.</p>
                        </div>
                        <div className="footer-links">
                            <a href="#">About</a>
                            <a href="#">Terms</a>
                            <a href="#">Privacy</a>
                        </div>
                        <div className="footer-socials">
                            <Instagram size={24} />
                            <Twitter size={24} />
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
