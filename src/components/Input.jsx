import './Input.css';

export default function Input({ label, error, icon: Icon, rightElement, className = '', containerClassName = '', ...props }) {
    return (
        <div className={`input-group ${containerClassName}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="input-wrapper">
                {Icon && <Icon className="input-icon" size={20} />}
                <input
                    className={`input ${Icon ? 'input-with-icon' : ''} ${error ? 'input--error' : ''} ${className}`}
                    {...props}
                />
                {rightElement && <div className="input-right-element">{rightElement}</div>}
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
}
