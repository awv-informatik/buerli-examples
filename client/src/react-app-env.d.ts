/// <reference types="react-scripts" />

declare module '*.of1'
declare module '*.stp'
declare module '*.ts'
declare module '*.tsx'

declare module '@mdx-js/react' {
  type MDXProps = {
    children: React.ReactNode
    components?: { wrapper: React.ReactNode }
  }
  export class MDXProvider extends React.Component<MDXProps> {}
}
