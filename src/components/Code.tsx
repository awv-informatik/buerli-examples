import { javascript } from '@codemirror/lang-javascript'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'

export const Code: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
  const [code, setCode] = React.useState<string>('')
  React.useEffect(() => {
    let value = ''
    const apply = async () => {
      try {
        value = await (await fetch(fileUrl)).text()
      } catch (error) {}
      setCode(value)
    }
    apply()
  }, [setCode, fileUrl])
  return code ? (
    <CodeMirror value={code} theme="dark" extensions={[javascript({ jsx: true, typescript: true })]} readOnly />
  ) : null
}

export default Code
