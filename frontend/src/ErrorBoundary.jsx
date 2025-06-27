import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur si besoin
    console.error('Erreur React capturée:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger mt-5">
          <h3>Une erreur est survenue dans l'application.</h3>
          <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          <p>Essayez de recharger la page ou contactez un administrateur.</p>
        </div>
      );
    }
    return this.props.children;
  }
} 