import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.css';
import rotateIcon from './icon/rotate.png';

const ImageView = ({ children, full = false }) => {
  const url = children.props.src;

  const [show, setShow] = useState(false);
  const imageViewRef = useRef();
  const content = document.getElementById('content');

  // 初始化位置
  const initImageLocation = () => {
    // 初始化位置
    imageViewRef.current.style.left = '';
    imageViewRef.current.style.top = '';
    imageViewRef.current.style.transform = '';
  };
  // 旋转图片
  const rotateImage = (e) => {
    const st = window.getComputedStyle(imageViewRef.current, null);
    const tr = st.getPropertyValue('transform');

    // console.log('tr:', tr)
    // 没有属性则直接赋值
    if (!tr || tr === 'none') {
      imageViewRef.current.style.transform = 'rotate(90deg)';
      return;
    }

    const values = tr.split('(')[1].split(')')[0].split(',');
    const a = values[0];
    const b = values[1];

    // next line works for 30deg but not 130deg (returns 50);
    // const  angle = Math.round(Math.asin(sin) * (180/Math.PI));
    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

    let newAgle = 0;

    switch (angle) {
      case 0:
        newAgle = 90;
        break;
      case 90:
        newAgle = 180;
        break;
      case 180:
        newAgle = 270;
        break;
      case -90:
        newAgle = 360;
        break;
      case -180:
        newAgle = 90;
        break;
      default:
        newAgle = 0;
        break;
    }
    // imageViewRef.current.style.transition = 'transform 0.15s';
    imageViewRef.current.style.transform = `rotate(${newAgle}deg)`;
  };

  // 缩放图片
  const scaleImage = () => {
    imageViewRef.current.onmousewheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const st = window.getComputedStyle(imageViewRef.current, null);
      const tr = st.getPropertyValue('transform');

      // 没有属性则直接赋值
      if (!tr || tr === 'none') {
        imageViewRef.current.style.transform = 'scale(0.9)';
        return;
      }

      const values = tr.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];

      let scale = Math.sqrt(a * a + b * b);
      let newScale = 1;

      if (e.wheelDelta) {
        // 判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta < 0) {
          // 当滑轮向下滚动时
          newScale = scale -= 0.1;
        }
        if (e.wheelDelta > 0) {
          // 当滑轮向上滚动时
          newScale = scale += 0.1;
        }
      } else if (e.detail) {
        // Firefox滑轮事件
        if (e.detail < 0) {
          // 当滑轮向下滚动时
          newScale = scale -= 0.1;
        }
        if (e.detail > 0) {
          // 当滑轮向上滚动时
          newScale = scale += 0.1;
        }
      }
      if (newScale > 3) {
        newScale = 3;
      } else if (newScale < 0.3) {
        newScale = 0.3;
      }

      imageViewRef.current.style.transform = `scale(${newScale})`;
    };
  };

  // 拖拽
  const onDrag = () => {
    imageViewRef.current.onmousedown = (e) => {
      if (e.button === 2) return; // 右键按下
      e.preventDefault();

      let bw = document.body.clientWidth;
      let bh = document.body.clientHeight;
      // 鼠标按下，计算当前元素距离可视区的距离
      let disX = e.clientX - imageViewRef.current.offsetLeft;
      let disY = e.clientY - imageViewRef.current.offsetTop;

      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let l = 0;
        let t = 0;
        // 拖动边界
        if (e.clientX >= bw) {
          l = bw - disX;
        } else if (e.clientX <= 200) {
          l = 200 - disX;
        } else {
          l = e.clientX - disX;
        }
        if (e.clientY >= bh) {
          t = bh - disY;
        } else if (e.clientY <= 0) {
          t = 0 - disY;
        } else {
          t = e.clientY - disY;
        }
        // 移动当前元素
        imageViewRef.current.style.left = l + 'px';
        imageViewRef.current.style.top = t + 'px';
      };
      // 事件移除
      document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  };

  useEffect(() => {
    if (!imageViewRef.current) {
      return;
    }
    // initImageLocation();
    // onDrag();
    // scaleImage();
  }, [children]);

  const onShow = () => {
    setShow(true);

    content.style.overflowY = 'hidden';
    content.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => {
      initImageLocation();
      onDrag();
      scaleImage();
    }, 100);
  };

  const onHide = () => {
    content.style.overflowY = 'auto';
    content.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    setShow(false);
  };

  if (!show) {
    return <div onClick={() => onShow()}>{children}</div>;
  }

  // const top = content.getBoundingClientRect().top;
  // const left = content.getBoundingClientRect().left;

  return ReactDOM.createPortal(
    <div
      onScroll={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div onClick={() => onShow()}>{children}</div>

      <div
        className={full ? styles.image_view_box_full : styles.image_view_box}
      >
        <div className={styles.image_view_bg} />
        <div className={styles.close_box} onClick={() => onHide()}>
          <div className={styles.close_item_l} />
          <div className={styles.close_item_h} />
        </div>
        <div className={styles.rotate_btn_box} onClick={rotateImage}>
          <img src={rotateIcon} className={styles.rotate_icon} />
        </div>

        <div className={styles.image_view_box} ref={imageViewRef}>
          <img src={url} className={styles.image} alt="" />
        </div>
      </div>
    </div>,
    document.getElementById('content')
  );
};

export default ImageView;
