/**
 * @see https://reactjs.org/docs/error-boundaries.html
 */

import React from 'react'

type State = { hasError?: boolean }
type Props = { inCanvas?: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.inCanvas ? null : <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
