function Input({ type, placeholder, value, onChange, className = "", style, ...rest }) {
  const classes = ["form-input", className].filter(Boolean).join(" ");

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={classes}
      style={style}
      {...rest}
    />
  );
}

export default Input;
