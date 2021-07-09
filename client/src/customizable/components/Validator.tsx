/**
 * @see https://reactjs.org/docs/error-boundaries.html
 */

import { api, DrawingID, useDrawing } from '@buerli.io/core'
import React from 'react'

type State = { hasError?: boolean }
type Props = { inCanvas?: boolean }

class ErrorBoundary extends React.Component<Props, State> {
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

/**
 * The Validator makes some basic checks on the buerli model to be valid.
 * It also wrappes all children into an ErrorBoundary.
 */
export const Validator: React.FC<{
  drawingId: DrawingID
  inCanvas?: boolean
  needsDrawing?: boolean
  needsCurrentProduct?: boolean
}> = ({ drawingId, inCanvas, needsDrawing, needsCurrentProduct, children }) => {
  const currDrExists = React.useMemo(() => drawingId && Boolean(api.getState().drawing.refs[drawingId]), [drawingId])
  const currProdId = useDrawing(drawingId, d => d?.structure?.currentProduct) || -1
  const currProdExists = useDrawing(drawingId, d => d?.structure?.tree[currProdId]?.class)
  if ((needsDrawing && !currDrExists) || (needsCurrentProduct && !currProdExists)) {
    return null
  }
  return <ErrorBoundary inCanvas={inCanvas}>{children}</ErrorBoundary>
}
