import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 에러 발생 시 상태를 업데이트합니다.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 여기에 로깅 로직을 추가합니다. 예: Sentry와 같은 로깅 서비스에 에러 보고
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // 오류가 있을 경우 fallback UI를 렌더링합니다.
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
