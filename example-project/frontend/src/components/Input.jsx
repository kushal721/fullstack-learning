// A labelled form field. The label's htmlFor matches the input's id, so
// clicking the label focuses the input and screen readers announce it.
export default function Input({ label, id, multiline = false, ...props }) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Field id={id} {...props} />
    </div>
  );
}
