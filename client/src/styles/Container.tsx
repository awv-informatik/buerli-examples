import styled from 'styled-components'

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
  display: grid;
  grid-template-rows: 120px 1fr;

  & h1 {
    font-style: normal;
    font-weight: 800;
    color: #272730;
    font-size: 36px;
    line-height: 16px;
    letter-spacing: -1px;
    margin-top: 1rem;
    margin-bottom: 3rem;
  }

  & h2 {
    font-style: normal;
    font-weight: 700;
    color: #272730;
    margin-top: 1rem;
    margin-bottom: 2.5rem;
    font-size: 32px;
    line-height: 72px;
    letter-spacing: -4px;
  }

  & h3 {
    font-style: normal;
    font-weight: 600;
    color: #272730;
    font-size: 28px;
    line-height: 32px;
    letter-spacing: -1px;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }

  & h4 {
    font-style: normal;
    font-weight: 500;
    color: #272730;
    font-size: 22px;
    line-height: 16px;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }

  & h5 {
    line-height: 18px;
    margin-top: 0rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
  }

  & p {
    font-size: 16.5px;
    margin-top: 1rem;
    margin-bottom: 0;
    -webkit-font-smoothing: antialiased;
  }

  & svg {
    color: #272730;
  }
`
