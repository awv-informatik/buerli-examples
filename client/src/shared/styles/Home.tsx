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
`
