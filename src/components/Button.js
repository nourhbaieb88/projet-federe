function Button({ text, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button type={type} className={`btn-primary ${className}`} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

export default Button;
