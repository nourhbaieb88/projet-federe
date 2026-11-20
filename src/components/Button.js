function Button({
  text,
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style,
  ...rest
}) {
  const classes = ["btn", className || "btn-primary"].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {children || text}
    </button>
  );
}

export default Button;
