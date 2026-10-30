import React from 'react';

export default function FormField({ label, name, error, as = 'input', children, ...props }) {
  const Tag = as;
  const id = `field-${name}`;
  return (
    <div className={`field${error ? ' invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}>{children}</Tag>
      {error && <div id={`${id}-error`} className="field-error" role="alert">{error}</div>}
    </div>
  );
}
