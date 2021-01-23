import styled from 'styled-components'

export const Home = styled.section`
  position: relative;
  width: 100%;
  margin-top: 0 !important;
  overflow: hidden;

  & .menu.left {
    position: absolute;
    top: 3rem;
    left: 4rem;
  }

  & .menu.right {
    position: absolute;
    top: 3rem;
    right: 4rem;
  }

  & .menu.middle {
    position: absolute;
    top: 3rem;
    left: 4rem;
    right: 4rem;
    display: flex;
    justify-content: center;
  }

  & .menu > a {
    text-decoration: none;
    padding-left: 1rem;
    padding-right: 1rem;
    color: #272730;
    font-size: 16.5px;
  }

  & .menu > a:not(:last-child) {
    border-right: 1px solid rgb(107, 113, 119);
  }

  @media (max-width: 900px) {
    & .menu.middle {
      display: none;
    }
  }
  @media (max-width: 580px) {
    & .menu.left {
      top: 2rem;
      left: 0.7rem;
    }

    & .menu.right {
      top: 2rem;
      right: 0rem;
    }
  }

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
