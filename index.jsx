import 'babel-polyfill';
import React from "react";
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import styled from "styled-components";
import Swiper from './src/index';

const StyledDiv = styled.div`
  width: 150px;
  height: 100px;
  margin: 0 5px;
  background-color: #aaa;
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        1, 2, 3, 4, 5
      ]
    };
  }
  render() {
    const { list } = this.state;
    return (<div>
      <Swiper
        ref={(swiper) => { this.swiper = swiper; }}
        loop={true}
        auto={false}
        interval={1000}
        slideAmount={1}
        displayAmount={1}
        cardsIncrement={3}
        // layout="center"
        initIndex={0}
        cardFollowRate={0.8}
        distanceLimit={40}
        onStart={(currentIndex, nextIndex) => {
          console.log('start', currentIndex, nextIndex);
        }}
        onEnd={(currentIndex) => {
          console.log('end', currentIndex);
        }}
        style={{
          backgroundColor: '#eee',
        }}
      >
        {list.map(item => <StyledDiv key={item}>{item}</StyledDiv>)}
      </Swiper>
      <button onClick={() => this.swiper.prev()}>Prev</button>
      <button onClick={() => this.swiper.next()}>Next</button>
    </div>);
  }
}

render(
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>,
  document.getElementById('app'),
);
