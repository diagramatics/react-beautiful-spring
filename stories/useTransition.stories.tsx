import React from 'react';
import { storiesOf } from '@storybook/react';
import { useTransition } from '../src/useTransition';

storiesOf('Transition', module).add(
  'Delay compare with CSS transitions',
  () => {
    function useInterval(callback: Function, delay: number) {
      const savedCallback = React.useRef<Function>();

      // Remember the latest callback.
      React.useEffect(() => {
        savedCallback.current = callback;
      }, [callback]);

      // Set up the interval.
      React.useEffect(() => {
        function tick() {
          if (savedCallback.current) {
            savedCallback.current();
          }
        }
        if (delay !== null) {
          const id = setInterval(tick, delay);
          return () => clearInterval(id);
        }
      }, [delay]);
    }

    const Component = () => {
      const [show, setShow] = React.useState(false);
      const [run, setRun] = React.useState(false);
      const nodeRef = React.useRef<HTMLDivElement>(null);
      const style = useTransition(show, {
        ref: nodeRef,
        from: {
          transform: 'scale(1)',
          // easing: 'ease-in-out',
        },
        enter: {
          transform: 'scale(1.25)',
          // easing: 'ease-in-out',
        },
        leave: {
          transform: 'scale(1)',
          // easing: 'ease-in-out',
        },
        duration: 500,
      });

      useInterval(() => {
        run && setShow(!show);
      }, 500);

      return (
        <>
          <button onClick={() => setRun(!run)}>Toggle</button>
          <div
            style={{
              background: 'black',
              width: '50px',
              height: '50px',
              ...style,
            }}
            ref={nodeRef}
            onMouseOver={() => setShow(true)}
            onMouseOut={() => setShow(false)}
          ></div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .a.b {
              transform: scale(1.25);
            }
          `,
            }}
          />
          <div
            className={`a ${show && 'b'}`}
            style={{
              background: 'black',
              width: '50px',
              height: '50px',
              transition: 'all 0.5s ease-in-out',
            }}
          ></div>
        </>
      );
    };

    return <Component />;
  },
);
