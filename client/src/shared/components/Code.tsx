import CodeMirror from '@uiw/react-codemirror'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
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
    <CodeMirror
      value={code}
      options={{
        folding: true,
        readOnly: true,
        theme: 'material',
        keyMap: 'sublime',
        mode: 'ts',
      }}
    />
  ) : null
}

export default Code
