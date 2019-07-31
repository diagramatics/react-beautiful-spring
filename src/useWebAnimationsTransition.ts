import * as React from 'react';

function convertKeyframeToCSSProperties(
  keyframe: Keyframe,
): React.CSSProperties {
  const {
    easing: _easing,
    composite: _composite,
    offset: _offset,
    ...cssProperties
  } = keyframe;

  if (cssProperties.cssOffset) {
    cssProperties.offset = cssProperties.cssOffset;
    delete cssProperties.cssOffset;
  }

  return cssProperties;
}

interface IntermediateStyles {
  [k: string]: string | number;
}
/**
 * Get the intermediate style of an element.
 * @param element The element.
 * @param referenceKeyframe The reference keyframe to pull data on what is being animated from.
 * This is to narrow down the style object we send back to a handful of properties that are involved
 * in the animation. This can be the last keyframe of the previously played animation.
 */
const getIntermediateStyles = (
  element: HTMLElement,
  referenceKeyframe: Keyframe,
): IntermediateStyles => {
  const cssProperties = convertKeyframeToCSSProperties(referenceKeyframe);

  const computedStyle = window.getComputedStyle(element);
  const styleObject = Object.keys(cssProperties).reduce<IntermediateStyles>(
    (obj, property): IntermediateStyles => {
      if (Object.prototype.hasOwnProperty.call(computedStyle, property)) {
        obj[property] = computedStyle[property as keyof CSSStyleDeclaration];
      }
      return obj;
    },
    {},
  );

  return styleObject;
};

type Config = {
  ref: React.RefObject<HTMLElement>;
  from: Keyframe;
  enter: Keyframe;
  leave: Keyframe;
  duration: number;
};

export const useWebAnimationsTransition = (
  show: boolean,
  config: Config,
): React.CSSProperties => {
  const { ref: nodeRef, from, enter, leave, duration } = config;

  const previousShow = React.useRef(show);
  const [style, setStyle] = React.useState<React.CSSProperties>(() =>
    convertKeyframeToCSSProperties(from),
  );
  const [isFinished, setIsFinished] = React.useState(true);
  const animationObject = React.useRef<Animation>();
  const animationLastKeyframe = React.useRef<Keyframe>();

  const onFinish = (): void => {
    setIsFinished(true);
    animationLastKeyframe.current = undefined;
    console.log('finish');
  };

  React.useLayoutEffect(() => {
    if (show !== previousShow.current) {
      previousShow.current = show;
      if (!nodeRef.current) {
        return;
      }

      if (show === true) {
        const beforeStyles = isFinished
          ? from
          : getIntermediateStyles(
              nodeRef.current,
              animationLastKeyframe.current || from,
            );
        console.log(beforeStyles);
        setStyle(convertKeyframeToCSSProperties(enter));
        // Cancel previous animation after we get the intermediate style.
        if (animationObject.current) {
          animationObject.current.cancel();
          animationObject.current = undefined;
        }
        const animation = nodeRef.current.animate([beforeStyles, enter], {
          duration,
          fill: 'both',
        });
        setIsFinished(false);
        animationObject.current = animation;
        animationLastKeyframe.current = enter;
        animation.addEventListener('finish', onFinish);
      } else if (show === false) {
        const beforeStyles = isFinished
          ? enter
          : getIntermediateStyles(
              nodeRef.current,
              animationLastKeyframe.current || enter,
            );
        console.log(beforeStyles);
        setStyle(convertKeyframeToCSSProperties(leave));
        // Cancel previous animation after we get the intermediate style.
        if (animationObject.current) {
          animationObject.current.cancel();
          animationObject.current = undefined;
        }
        const animation = nodeRef.current.animate([beforeStyles, leave], {
          duration,
          fill: 'both',
        });
        setIsFinished(false);
        animationObject.current = animation;
        animationLastKeyframe.current = leave;
        animation.addEventListener('finish', onFinish);
      }
    }
  }, [duration, enter, from, isFinished, leave, nodeRef, show]);

  return style;
};
