// One button for the whole app: change the style here and every form,
// card and menu follows. Any other prop (type, onClick, disabled…) is
// passed straight to the real <button>.
export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`button button-${variant}`} {...props}>
      {children}
    </button>
  );
}
