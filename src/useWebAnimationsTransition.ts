import * as React from 'react';

/**
 * Get the intermediate style of an element.
 * @param node The node of the element.
 * @param referenceKeyframe The reference keyframe to pull data on what is being animated from.
 * This is to narrow down the style object we send back to a handful of properties that are involved
 * in the animation. This can be the last keyframe of the previously played animation.
 */
const getIntermediateStyles = (node, referenceKeyframe) => {
  const {
    easing: _easing,
    composite: _composite,
    offset: _offset,
    ...cssProperties
  } = referenceKeyframe;

  if (cssProperties.cssOffset) {
    cssProperties.offset = cssProperties.cssOffset;
    delete cssProperties.cssOffset;
  }

  const computedStyle = window.getComputedStyle(node);
  const styleObject = Object.keys({ ...cssProperties })
    .reduce((obj, property) => {
      obj[property] = computedStyle[property];
      return obj;
    }, {});

  return styleObject;
};

export const useWebAnimationsTransition = (show, config) => {
  const { ref: nodeRef, from, enter, leave, duration } = config;

  const previousShow = React.useRef(show);
  const [style, setStyle] = React.useState(() => from);
  const [isFinished, setIsFinished] = React.useState(true);
  const animationObject = React.useRef();
  const animationLastKeyframe = React.useRef();

  const onFinish = () => {
    setIsFinished(true);
    animationLastKeyframe.current = undefined;
    console.log('finish');
  }

  React.useLayoutEffect(() => {
    if (show !== previousShow.current) {
      previousShow.current = show;
      if (!nodeRef.current) {
        return;
      }

      if (show === true) {
        const beforeStyles = isFinished
          ? from
          : getIntermediateStyles(nodeRef.current, animationLastKeyframe.current || from);
        console.log(beforeStyles);
        setStyle(enter);
        // Cancel previous animation after we get the intermediate style.
        if (animationObject.current) {
          animationObject.current.cancel();
          animationObject.current = undefined;
        }
        const animation = nodeRef.current.animate([
          beforeStyles,
          enter,
        ], { duration, fill: 'both' });
        setIsFinished(false);
        animationObject.current = animation;
        animationLastKeyframe.current = enter;
        animation.addEventListener('finish', onFinish);
      } else if (show === false) {
        const beforeStyles = isFinished
          ? enter
          : getIntermediateStyles(nodeRef.current, animationLastKeyframe.current || enter);
        console.log(beforeStyles);
        setStyle(leave);
        // Cancel previous animation after we get the intermediate style.
        if (animationObject.current) {
          animationObject.current.cancel();
          animationObject.current = undefined;
        }
        const animation = nodeRef.current.animate([
          beforeStyles,
          leave,
        ], { duration, fill: 'both' });
        setIsFinished(false);
        animationObject.current = animation;
        animationLastKeyframe.current = leave;
        animation.addEventListener('finish', onFinish);
      }
    }
  }, [show]);


  return style;
};
