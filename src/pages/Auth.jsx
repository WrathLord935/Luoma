import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, Briefcase, FileText, Github, Globe } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext'; // Updated import
import './Auth.css';

const TESTIMONIALS = [
    { quote: "Sustainable fashion isn't just a choice. It's the only way forward.", author: "Looma Manifesto" },
    { quote: "The future of style is circular. Join the revolution.", author: "Vogue 2025" },
    { quote: "Finally, a marketplace that understands Gen Z aesthetics.", author: "@fashion_killa" }
];



export default function Auth() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();


    // State
    const [isSignUp, setIsSignUp] = useState(false);
    const [userType, setUserType] = useState('individual'); // 'individual' | 'business'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeQuote, setActiveQuote] = useState(0);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        taxId: ''
    });

    useEffect(() => {
        setIsSignUp(searchParams.get('mode') === 'signup');
        setErrors({}); // Clear errors on mode switch
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear passwords
    }, [searchParams]);

    // Quote Cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveQuote(prev => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        navigate(`/auth?mode=${!isSignUp ? 'signup' : 'signin'}`);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        // Handle file inputs
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        setAuthError(null);

        // Basic Validation
        if (isSignUp && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (isSignUp && userType === 'business' && !formData.taxId) {
            newErrors.taxId = "Tax ID document is required for business accounts";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            if (isSignUp) {
                // SignUp Logic
                const typeIndividual = userType === 'individual';

                await signUp(
                    formData.email,
                    formData.password,
                    formData.name, // Using name as username
                    typeIndividual
                );
                navigate('/home');
            } else {
                // SignIn Logic
                await signIn(formData.email, formData.password);
                navigate('/home');
            }
        } catch (error) {
            console.error("Auth Error:", error);
            setAuthError(error.message || "An error occurred during authentication.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            {/* LEFT SIDE - VISUALS */}
            <div className="auth-visual-side">
                <div className="visual-content">
                    <div className="brand-badge">LOOMA</div>
                    <h1 className="visual-title">
                        {isSignUp ? 'JOIN THE' : 'WELCOME'} <br />
                        <span className="outline-text">{isSignUp ? 'CULT.' : 'BACK.'}</span>
                    </h1>

                    <div className="quote-container">
                        {TESTIMONIALS.map((t, idx) => (
                            <div
                                key={idx}
                                className={`visual-quote ${idx === activeQuote ? 'active' : ''}`}
                            >
                                "{t.quote}"
                                <span className="quote-author">— {t.author}</span>
                            </div>
                        ))}
                    </div>

                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                    </div>
                </div>
                <div className="visual-overlay"></div>
                <div className="noise-overlay"></div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="auth-form-side">
                <div className="form-container animate-fade-in">
                    <div className="form-header">
                        <button className="auth-back-btn" onClick={() => navigate('/')} title="Back to Home">
                            <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back
                        </button>
                        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                        <p>{isSignUp ? 'Start your swapping journey.' : 'Welcome back.'}</p>
                    </div>

                    {/* COMPACT SOCIAL LOGIN */}
                    <div className="social-row">
                        <button type="button" className="social-btn" title="Continue with Google">
                            <Globe size={20} />
                        </button>
                        <button type="button" className="social-btn" title="Continue with GitHub">
                            <Github size={20} />
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    {/* USER TYPE TOGGLE (Sign Up Only) */}
                    {isSignUp && (
                        <div className="user-type-toggle animate-slide-up">
                            <button
                                className={`type-btn ${userType === 'individual' ? 'active' : ''}`}
                                onClick={() => setUserType('individual')}
                                type="button"
                            >
                                <UserIcon size={16} /> Individual
                            </button>
                            <button
                                className={`type-btn ${userType === 'business' ? 'active' : ''}`}
                                onClick={() => setUserType('business')}
                                type="button"
                            >
                                <Briefcase size={16} /> Business
                            </button>
                        </div>
                    )}

                    <form className="modern-auth-form" onSubmit={handleSubmit}>

                        {isSignUp && (
                            <div className="form-group animate-slide-up">
                                <label>
                                    {userType === 'business' ? 'Business Name' : 'Full Name'}
                                </label>
                                <Input
                                    name="name"
                                    placeholder={userType === 'business' ? "Looma Inc." : "Alex R."}
                                    type="text"
                                    icon={userType === 'business' ? Briefcase : UserIcon}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group animate-slide-up delay-100">
                            <label>Email</label>
                            <Input
                                name="email"
                                placeholder="name@ex.com"
                                type="email"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group animate-slide-up delay-200">
                            <label>Password</label>
                            <Input
                                name="password"
                                placeholder="••••••"
                                type={showPassword ? "text" : "password"}
                                icon={Lock}
                                value={formData.password}
                                onChange={handleInputChange}
                                rightElement={
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                                required
                            />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        {isSignUp && (
                            <div className="form-group animate-slide-up delay-300">
                                <label>Confirm Password</label>
                                <Input
                                    name="confirmPassword"
                                    placeholder="••••••"
                                    type={showConfirmPassword ? "text" : "password"}
                                    icon={Lock}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    error={errors.confirmPassword}
                                    rightElement={
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    }
                                    required
                                />
                            </div>
                        )}

                        {/* TAX ID FIELD (Business Only) */}
                        {isSignUp && userType === 'business' && (
                            <div className="form-group animate-slide-up">
                                <label>Tax ID / Business Proof</label>
                                <div className={`file-upload-area compact ${errors.taxId ? 'error' : ''}`}>
                                    <input
                                        type="file"
                                        id="taxId-upload"
                                        name="taxId"
                                        accept=".pdf,.jpg,.png"
                                        onChange={handleInputChange}
                                        className="hidden-file-input"
                                    />
                                    <label htmlFor="taxId-upload" className="file-upload-label">
                                        <FileText size={18} />
                                        <span>
                                            {formData.taxId
                                                ? formData.taxId.name
                                                : "Upload ID (PDF/JPG)"}
                                        </span>
                                    </label>
                                </div>
                                {errors.taxId && <span className="input-error">{errors.taxId}</span>}
                            </div>
                        )}

                        {authError && <div className="auth-error-message" style={{ color: 'red', marginBottom: '1rem' }}>{authError}</div>}

                        <Button className="auth-btn-primary" size="lg" type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (isSignUp ? 'Join' : 'Sign In')} {!isLoading && <ArrowRight size={18} />}
                        </Button>
                    </form>

                    <div className="auth-footer-text">
                        {isSignUp ? 'Member?' : "New?"}{' '}
                        <button className="text-link" onClick={toggleMode}>
                            {isSignUp ? 'Sign In' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
