export default function LoadingButton({
  children,
  loading = false,
  onClick,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: "14px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        fontSize: "16px",
        opacity: loading ? 0.8 : 1,
      }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}