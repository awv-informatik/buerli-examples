import { javascript } from '@codemirror/lang-javascript'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'

export const Code: React.FC<{ data: Promise<any> }> = ({ data }) => {
  const [code, setCode] = React.useState<string>('')
  React.useEffect(() => {
    let value = ''
    const apply = async () => {
      try {
        const res = await data
        if ('default' in res) {
          value = res.default
        } else if ('text' in res) {
          value = await res.text()
        }
      } catch (error) {}
      setCode(value)
    }
    apply()
  }, [data, setCode])
  return code ? (
    <CodeMirror
      value={code}
      theme="dark"
      extensions={[javascript({ jsx: true, typescript: true })]}
      readOnly
    />
  ) : null
}

export default Code
