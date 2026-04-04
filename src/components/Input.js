function Input({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={styles.input}
    />
  );
}

const styles = {
  input: {
    display: "block",
    margin: "10px 0",
    padding: "10px",
    width: "250px"
  }
};

export default Input;
