/// <reference types="vite/client" />

declare module '*.ofb'
declare module '*.stp'
declare module '*.step'
declare module '*.ts'
declare module '*.tsx'

declare module '*?buffer' {
  const buffer: ArrayBuffer
  export default buffer
}

declare module '@mdx-js/react' {
  type MDXProps = {
    children: React.ReactNode
    components?: { wrapper: React.ReactNode }
  }
  export class MDXProvider extends React.Component<MDXProps> {}
}

// Dirty workaround
declare const require: any
