/* eslint-disable react/display-name */
import { MDXProvider } from '@mdx-js/react'
import React from 'react'
import { Spin } from '../../shared/components'

export const MarkdownLazy: React.FC<{ data: Promise<{ default: any }> }> = ({ data }) => {
  const Comp = React.useMemo(() => React.lazy(() => data), [data])
  return Comp ? (
    <div style={{ fontSize: '!important inherit' }}>
      <MDXProvider components={components}>
        <React.Suspense fallback={<Spin />}>
          <Comp />
        </React.Suspense>
      </MDXProvider>
    </div>
  ) : null
}

const components = {
  wrapper: (props: any) => <>{props.children}</>,
  p: (props: any) => <p {...props} style={{ fontSize: '15px' }} />,
}
