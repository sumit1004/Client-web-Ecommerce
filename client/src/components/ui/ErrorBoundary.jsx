import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-screen">
          <h1>Something did not load correctly.</h1>
          <p>Please refresh the page. The store is designed to recover cleanly without exposing technical details.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh</button>
        </main>
      );
    }
    return this.props.children;
  }
}
