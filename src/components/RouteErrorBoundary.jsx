import { Component } from 'react';
import { ErrorState } from './ui/States.jsx';

/** Catches render-time crashes anywhere in the routed tree so a bug in one page shows a
 * recoverable error instead of a blank white screen for the whole app. */
export class RouteErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (console?.error) console.error('[RouteErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          className="mx-auto my-16 max-w-lg"
          title="Something went wrong"
          error={{ message: 'This page hit an unexpected error. Reloading usually fixes it.' }}
          onRetry={() => {
            this.setState({ error: null });
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}
