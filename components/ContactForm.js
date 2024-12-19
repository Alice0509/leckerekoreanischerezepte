// components/ContactForm.js

import { useForm, ValidationError } from '@formspree/react';
import styles from '../styles/ContactForm.module.css';

const ContactForm = () => {
  const [state, handleSubmit] = useForm('xbljnorv'); // Replace with your actual Formspree form ID

  if (state.succeeded) {
    return <p className={styles.successMessage}>Thank you for your message!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="email" className={styles.label}>
        Email Address
      </label>
      <input
        id="email"
        type="email"
        name="email"
        className={styles.input}
        required
      />
      <ValidationError
        prefix="Email"
        field="email"
        errors={state.errors}
        className={styles.error}
      />

      <label htmlFor="message" className={styles.label}>
        Message
      </label>
      <textarea
        id="message"
        name="message"
        className={styles.textarea}
        required
      ></textarea>
      <ValidationError
        prefix="Message"
        field="message"
        errors={state.errors}
        className={styles.error}
      />

      <button
        type="submit"
        disabled={state.submitting}
        className={styles.button}
      >
        Submit
      </button>

      {/* Safely handle state.errors being null */}
      {state.errors?.length > 0 && (
        <p className={styles.errorMessage}>
          There was an error submitting your message. Please try again.
        </p>
      )}
    </form>
  );
};

export default ContactForm;
