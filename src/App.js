import { useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useAppStore } from "./store";
import { useScrollPosition } from "./useScrollPosition";
import { useWindowSize } from "./useWindowSize";

import "./styles.css";

export default function App() {
  const videoRef = useRef(null);

  // actions
  const { setVideoLoaded, updateFrame, setSrollHeight } = useAppStore(
    (state) => state.actions
  );

  // total frames * fps * window.innerheight
  const scrollHeight = useAppStore((state) => state.scrollHeight);
  const frameHeight = useAppStore((state) => state.frameHeight);
  // the video element
  const $video = useAppStore((state) => state.$video);
  // after media data has loaded
  const isLoaded = useAppStore((state) => state.isLoaded);
  // video duration in seconds
  const duration = useAppStore((state) => state.duration);
  // what time the playhead is at
  const currentTime = useAppStore((state) => state.currentTime);

  // get the window size on resize
  const windowSize = useWindowSize();
  // get the scrolling position continuously
  const scrollPosition = useScrollPosition();

  // Loaded Data handler, that is, the function that runs after the video is ready to play
  const handleLoadedData = useCallback(
    (event) => {
      if (videoRef.current) {
        const { height } = windowSize;

        console.log("DATA LOADED", {
          event,
          ref: videoRef.current,
          height,
          windowSize
        });
        // get the video element from the ref node, and get video metadata
        setVideoLoaded(videoRef, height);
      }
    },
    [videoRef, setVideoLoaded, windowSize]
  );

  // when scrollPosition changes, update the frame and do calculations
  useEffect(() => {
    // when video loaded event triggers
    if (isLoaded) {
      // console.log("scroll", { isLoaded, scrollPosition });
      // update store and calculate positions and percent
      updateFrame(scrollPosition);
    }
  }, [isLoaded, scrollPosition, updateFrame]);

  // when currentTime changes, advance the playhead
  useEffect(() => {
    if (currentTime && currentTime >= 0) {
      $video.currentTime = currentTime;
    }
  }, [$video, currentTime]);

  // update calculations when window resizes
  useEffect(() => {
    if (windowSize?.height) {
      setSrollHeight(windowSize.height);
    }
  }, [windowSize, setSrollHeight]);

  // console.log({ isLoaded, duration, scrollPosition, scrollableHeight });

  return (
    <div className="App">
      <div
        className="spacer"
        // add 1 extra frameHeight to total to allow scrolling all the way to 100%
        style={{ height: `${scrollHeight + frameHeight}px` }}
      />

      <div className="vid-container">
        <video
          ref={videoRef}
          className="video"
          preload="auto"
          playsInline
          onLoadedData={handleLoadedData}
        >
          <source src="/output.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
