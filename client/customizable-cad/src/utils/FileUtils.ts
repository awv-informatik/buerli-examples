/**
 * Simple helper functions for file interaction.
 */
export const FileUtils = {
  /**
   * Loads a file from the file system.
   * It uses @see document and is therefore directly dependent on the DOM.
   *
   * @param onLoad The callback.
   * @param type The content type.
   */
  loadFile: (
    onLoad: (file: File, content: any) => void,
    type?: 'DataURL' | 'ArrayBuffer' | 'BinaryString' | 'Text',
  ) => {
    const handler = (event: any) => {
      if (event.target && event.target.files) {
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = async () => {
          onLoad(file, reader.result)
        }
        switch (type) {
          case 'DataURL':
            reader.readAsDataURL(file)
            break

          case 'BinaryString':
            reader.readAsBinaryString(file)
            break

          case 'Text':
            reader.readAsText(file)
            break

          case 'ArrayBuffer':
          default:
            reader.readAsArrayBuffer(file)
            break
        }
        event.target.value = ''
      }
    }

    const loaderId = '________customizable_cad_fileloader________'
    const loaderSelector = `#${loaderId}`
    let loader: HTMLInputElement | null = document.querySelector(loaderSelector)
    if (!loader || !loader.onchange) {
      loader = document.createElement('input')
      loader.id = loaderId
      loader.type = 'file'
      loader.style.display = 'none'
      document.body.appendChild(loader)
    }
    if (loader) {
      loader.onchange = handler
      loader.click()
    }
  },
}
