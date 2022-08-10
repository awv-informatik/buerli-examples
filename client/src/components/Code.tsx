import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import React from 'react'

export const Code: React.FC<{ data: Promise<{ default: any }> }> = ({ data }) => {
  const [code, setCode] = React.useState<string>('')
  React.useEffect(() => {
    const apply = async () => {
      const value = (await data).default
      setCode(value)
    }
    apply()
  }, [data, setCode])
  return code ? (
    <CodeMirror value={code} theme="dark" extensions={[javascript({ jsx: true, typescript: true })]} readOnly />
  ) : null
}

export default Code
