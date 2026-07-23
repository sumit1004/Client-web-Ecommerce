export function Button({ as: Component = 'button', className = '', variant = 'primary', size = 'medium', children, ...props }) {
  return (
    <Component className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {children}
    </Component>
  );
}
