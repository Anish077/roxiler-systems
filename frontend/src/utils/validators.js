export const validators = {
  name: (v) => {
    if (!v) return 'Name is required';
    if (v.length < 20) return 'Name must be at least 20 characters';
    if (v.length > 60) return 'Name cannot exceed 60 characters';
    return '';
  },
  email: (v) => {
    if (!v) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(v)) return 'Please enter a valid email';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8 || v.length > 16) return 'Password must be 8–16 characters';
    if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) return 'Must contain at least one special character';
    return '';
  },
  address: (v) => {
    if (!v) return 'Address is required';
    if (v.length > 400) return 'Address cannot exceed 400 characters';
    return '';
  },
};

export const validateForm = (fields) => {
  const errors = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (validators[key]) {
      const err = validators[key](value);
      if (err) errors[key] = err;
    }
  });
  return errors;
};
