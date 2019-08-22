# simple-swiper
A simple swiper component for react

### className: string

### style: any

### loop: boolean;
是否启用循环滑动。(default: false)

### auto: boolean;
是否启用自动滑动。(default: false)

### interval: number
自动滑动的时间间隔，单位ms。(default: 3000)

### animationTime: number
滑动动画的时间，单位ms。(default: 300)

### cardFollowRate: number
卡片跟随手指滑动的程度(0 ~ 1)，置为 0 则不跟随手指滑动。(default: 1)

### distanceLimit: number;
触发滑动所需的手指滑动距离(default: 80)

### layout: string
滑动卡片的布局方式，center 或 contain，后者的回调函数中返回的 index 可能存在 bug。(default: 'center',)

### slideAmount: number
每次滑动的卡片数量。(default: 1)

### displayAmount: number
每一屏呈现的卡片数量。(default: 1)

### cardsIncrement: number
启用循环滑动后，如出现空白，可以设置或增大该值。(default: 1)

### initIndex: number
初始化时自动滚动到指定的卡片处。(default: 0)

### onStart(currentIndex: number, nextIndex: number)
开始滑动时触发

### onEnd(currentIndex: number)
滑动结束时触发

### prev 和 next
控制滑动的方法

<Swiper ref={(swiper) => { this.swiper = swiper; }}>
  ...
</Swiper>

this.swiper.prev();
this.swiper.next();