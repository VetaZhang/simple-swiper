import React, { Children } from "react";
import { StyledSwiper, StyledContent } from "./style";

// interface ICard {
//   dom: any;
//   totalWidth: number;
//   offset: number;
//   index: number;
// }

// interface ISwiperState {
//   swiperWidth: number;
//   contentWidth: number;
//   cards: ICard[];
// }

// interface ISwiperProps {
//   className?: string;
//   style?: any;
//   loop?: boolean;
//   auto?: boolean;
//   interval?: number;
//   animationTime?: number;
//   cardFollowRate: number;
//   distanceLimit: number;
//   // layout?: string;
//   slideAmount?: number;
//   displayAmount?: number;
//   cardsIncrement?: number;
//   initIndex?: number;
//   onStart(currentIndex?: number, nextIndex?: number): void;
//   onEnd(currentIndex?: number): void;
// }

const getDomStyle = (dom, styleName) => {
  if (dom.currentStyle) {
    return parseFloat(dom.currentStyle[styleName]);
  } else if (window.getComputedStyle) {
    return parseFloat(window.getComputedStyle(dom, null)[styleName]);
  }
}

const getTransformStyleName = () => {
  if (typeof document !== 'undefined') {
    const elementStyle = document.createElement('div').style;
    const vendors = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
    const nameList = [
      { styleName: 'transform', transitionName: 'transform' },
      { styleName: 'webkitTransform', transitionName: '-webkit-transform' },
      { styleName: 'MozTransform', transitionName: '-moz-transform' },
      { styleName: 'msTransform', transitionName: '-ms-transform' },
      { styleName: 'OTransform', transitionName: '-o-transform' },
    ];
    for (let i = 0; i < nameList.length; i++) {
      if (nameList[i].styleName in elementStyle) return nameList[i];
    }
  }
	return null;
};

const transformInfo = getTransformStyleName();

class Swiper extends React.Component {
  constructor(props) {
    super(props);
    this.currentIndex = props.initIndex;
    this.state = {
      swiperWidth: 0,
      contentWidth: 0,
      cards: [],
    };
    this.swiper = null;
    this.content = null;
    this.autoSwiper = null;
    this.currentIndex = 0;
    this.startX = 0;
    this.distance = 0;
    this.originChildrenAmount = 0;
    // this.originChildrenWidth = 0;
    this.standStartIndex = 0;
  }

  componentDidMount() {
    this.init();
  }

  init() {
    if (this.swiper && this.content) {
      this.addListenerToContent();
      const { slideAmount, displayAmount, initIndex, loop } = this.props;

      const swiperWidth = getDomStyle(this.swiper, 'width');
      let cards = [];
      let startIndex = 0;
      let currentIndex = 0;
      let contentWidth = 0;
      let totalWidthOfPrevCard = 0;

      for (let i = 0; i < this.content.childNodes.length; i++) {
        const item = this.content.childNodes[i];
        const width = getDomStyle(item, 'width');
        const marginLeft = getDomStyle(item, 'marginLeft');
        const marginRight = getDomStyle(item, 'marginRight');
        const totalWidth = width + marginLeft + marginRight;
        contentWidth += totalWidth;
        cards.push({ dom: item, totalWidth });
      }
      // this.content.childNodes.forEach((item, index) => {
      //   const width = getDomStyle(item, 'width');
      //   const marginLeft = getDomStyle(item, 'marginLeft');
      //   const marginRight = getDomStyle(item, 'marginRight');
      //   const totalWidth = width + marginLeft + marginRight;
      //   contentWidth += totalWidth;
      //   // if (index >= this.standStartIndex && index < this.standStartIndex + displayAmount) {
      //   //   this.originChildrenWidth += totalWidth;
      //   // }
      //   cards.push({ dom: item, totalWidth });
      // });

      const headExtraNumber = this.standStartIndex % this.originChildrenAmount
      startIndex = headExtraNumber ? this.originChildrenAmount - headExtraNumber : 0;

      cards = cards.map((item, index) => {
        const displayWidth = cards.slice(index, index + displayAmount).reduce((a, b) => ({ totalWidth: a.totalWidth + b.totalWidth }));
        const primaryOffset = (swiperWidth - displayWidth.totalWidth) / 2;

        item.offset = primaryOffset - totalWidthOfPrevCard;
        totalWidthOfPrevCard += item.totalWidth;
        item.index = loop ? startIndex : index;
        startIndex = (startIndex + 1) % this.originChildrenAmount;
        return item;
      });

      if (loop) {
        currentIndex = this.standStartIndex + initIndex % this.originChildrenAmount;
      } else {
        currentIndex = initIndex % this.originChildrenAmount;
      }
      
      this.moveTo(cards[currentIndex].offset);
      this.currentIndex = currentIndex;
      this.setState({
        cards,
        swiperWidth,
        contentWidth,
      }, () => {
        this.startAutoSwiper();
      });
    }
  }

  startAutoSwiper() {
    const { auto, interval } = this.props;
    if (auto) {
      this.autoSwiper = setInterval(() => {
        if (this.content) {
          this.nextCard(true);
        }
      }, interval);
    }
  }

  stopAutoSwiper() {
    clearInterval(this.autoSwiper);
  }

  addListenerToContent() {
    this.swiper.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    });
    this.swiper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTouchMove(e);
    }, { passive: false });
    this.swiper.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
    });
  }

  handleTouchStart(e) {
    const eventData = e.changedTouches[0];
    const { clientX } = eventData;
    this.stopAutoSwiper();
    this.startX = clientX;
    if (this.content) {
      this.closeTransition();
    }
  }

  handleTouchMove(e) {
    const { displayAmount, cardFollowRate, loop } = this.props;
    const { cards } = this.state;
    const eventData = e.changedTouches[0];
    this.distance = eventData.clientX - this.startX;
    if (Math.abs(this.distance) > 5 && this.content) {
      if (loop) {
        if (this.distance < 0) {
          this.positionBackward();
        } else if (this.distance > 0) {
          this.positionForward();
        }
      }
      let curr = cards[this.currentIndex].offset;
      this.moveTo(this.calcOffset(curr) + this.distance * cardFollowRate);
    }
  }

  positionBackward() {
    const { displayAmount } = this.props;
    const { cards } = this.state;

    this.closeTransition();

    if (this.currentIndex - this.standStartIndex > this.originChildrenAmount - Math.ceil(displayAmount / 2) - 1) {
      const current = this.currentIndex - this.originChildrenAmount;
      const offset = cards[current].offset;
      this.moveTo(offset);
      this.currentIndex = current;
    }
    // this.openTransition();
  }

  positionForward() {
    const { displayAmount } = this.props;
    const { cards } = this.state;

    this.closeTransition();

    if (this.currentIndex < this.standStartIndex + Math.ceil(displayAmount / 2)) {
      const current = this.currentIndex + this.originChildrenAmount;
      const offset = cards[current].offset;
      this.moveTo(offset);
      this.currentIndex = current;
    }
    // this.openTransition();
  }

  handleLoopIndex(i) {
    const { loop } = this.props;
    const { cards } = this.state;
    if (loop) {
      return cards[i].index;
    }
    return i;
  }

  triggerEvent(currentIndex, nextIndex ) {
    const { onStart, onEnd, animationTime, loop } = this.props;
    onStart(this.handleLoopIndex(currentIndex), this.handleLoopIndex(nextIndex));
    setTimeout(() => onEnd(this.handleLoopIndex(nextIndex)), animationTime / 1000);
  }

  calcOffset(next) {
    // const { layout } = this.props;
    // const { swiperWidth, contentWidth } = this.state;
    // if (layout === 'contain') {
    //   if ((contentWidth - swiperWidth) < Math.abs(next)) {
    //     return swiperWidth - contentWidth;
    //   }
    // }
    return next;
  }

  openTransition() {
    const { animationTime } = this.props;
    if (transformInfo) {
      this.content.style.transition = `${transformInfo.transitionName} ${animationTime / 1000}s`;
    } else {
      this.content.style.transition = `left ${animationTime / 1000}s`;
    }
  }

  closeTransition() {
    this.content.style.transition = 'none';
  }

  moveTo(offset) {
    if (transformInfo) {
      this.content.style[transformInfo.styleName] = `translateX(${offset}px)`;
    } else {
      this.content.style.left = `${offset}px`;
    }
  }

  prev() {
    const { loop } = this.props;
    this.stopAutoSwiper();
    if (loop) {
      this.positionForward();
    }
    setTimeout(() => {
      this.openTransition();
      this.prevCard();
      this.startAutoSwiper();
    }, 50);
  }

  next() {
    const { loop } = this.props;
    this.stopAutoSwiper();
    if (loop) {
      this.positionBackward();
    }
    setTimeout(() => {
      this.openTransition();
      this.nextCard(true);
      this.startAutoSwiper();
    }, 50);
  }

  prevCard() {
    const { cards } = this.state;
    const { slideAmount } = this.props;
    let prev;

    if (this.currentIndex > 0) {
      let next = Math.max(this.currentIndex - slideAmount, 0);
      this.triggerEvent(this.currentIndex, next);
      prev = cards[next].offset;
      this.currentIndex = next;
    } else {
      this.triggerEvent(0, 0);
      prev = cards[0].offset;
      this.currentIndex = 0;
    }
    
    this.moveTo(this.calcOffset(prev));
  }

  currentCard() {
    const { cards } = this.state;

    this.triggerEvent(this.currentIndex, this.currentIndex);
    let next = cards[this.currentIndex].offset;
    this.moveTo(this.calcOffset(next));
  }

  nextCard(isAuto) {
    const { slideAmount, displayAmount, loop, animationTime } = this.props;
    const { cards } = this.state;
    const nextIndex = this.currentIndex + slideAmount;
    let next;

    if (isAuto) {
      this.openTransition();
    }

    const shouldLoop = this.currentIndex - this.standStartIndex > this.originChildrenAmount - Math.ceil(displayAmount / 2) - 1;

    if (loop && isAuto && shouldLoop) {
      this.closeTransition();
      const current = this.currentIndex - this.originChildrenAmount;
      next = cards[current].offset;
      this.triggerEvent(this.currentIndex, current);
      this.currentIndex = current;
      this.moveTo(next);
      return setTimeout(() => this.nextCard(true), 1);
    }
    if (this.currentIndex + displayAmount < cards.length) {
      this.triggerEvent(this.currentIndex, nextIndex);
      next = cards[nextIndex].offset;
      this.currentIndex = nextIndex;
    } else if (isAuto) {
      this.triggerEvent(this.currentIndex, 0);
      next = cards[0].offset;
      this.currentIndex = 0;
    } else {
      this.triggerEvent(this.currentIndex, this.currentIndex);
      next = cards[cards.length - displayAmount].offset;
      this.currentIndex = cards.length - displayAmount;
    }
    this.moveTo(this.calcOffset(next));
  }

  handleTouchEnd(e) {
    const { distanceLimit } = this.props;

    this.openTransition();

    if (Math.abs(this.distance) > distanceLimit) {
      if (this.distance > 0) {
        this.prevCard();
      } else if (this.distance < 0) {
        this.nextCard(false);
      }
    } else {
      this.currentCard();
    }
    this.startAutoSwiper();
  }

  getLoopChildren() {
    const { children, displayAmount, cardsIncrement } = this.props;
    const amount = displayAmount + cardsIncrement;
    const list = React.Children.toArray(children);
    const head = [];
    const tail = [];

    for (let i = 0; i < amount; i++) {
      tail.push([list[i % this.originChildrenAmount]]);
    }
    list.reverse();
    for (let i = 0; i < amount; i++) {
      head.unshift([list[i % this.originChildrenAmount]]);
    }

    this.standStartIndex = head.length;

    return head.concat([list.reverse()], tail);
  }

  renderChildren() {
    const { children, loop } = this.props;
    const { contentWidth } = this.state;

    this.originChildrenAmount = React.Children.count(children);

    return <StyledContent
      ref={content => { this.content = content; }}
      style={{
        width: `${contentWidth}px`,
      }}
    >
      {loop ? this.getLoopChildren() : children}
    </StyledContent>;
  }

  render() {
    const { children, className, style } = this.props;

    return (
      <StyledSwiper
        ref={swiper => { this.swiper = swiper; }}
        className={className}
        style={style}
      >
        {this.renderChildren()}
      </StyledSwiper>
    );
  }
}

Swiper.defaultProps = {
  loop: false,
  auto: false,
  interval: 3000,
  animationTime: 300,
  cardFollowRate: 1,
  distanceLimit: 80,
  // layout: 'center', // center, contain
  slideAmount: 1,
  displayAmount: 1,
  cardsIncrement: 1,
  initIndex: 0,
  onStart() {},
  onEnd() {},
};

export default Swiper;
