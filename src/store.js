import { createStore, useStore } from "zustand";
import { devtools } from "zustand/middleware";

// clamp percents between 0,100
const clamp = (num, min = 0, max = 100) => Math.min(Math.max(num, min), max);

// what framerate was the video rendered with
const frameRate = 30;

// initial store values
const initialState = () => ({
  isLoaded: false,
  $video: null,

  currentFrame: 0,
  totalFrames: 0,

  currentTime: 0,
  duration: 0,
  percentPlayed: 0,

  // height for the frame/container. Could be window.innerHeight
  frameHeight: 0,
  // total calculated height of the scoll area
  scrollHeight: 0,
  percentScrolled: 0,

  // how much does each scroll count for
  // divide the total height by, multiply scroll by. Speed basically.
  scrollMultiplier: 25
});

export const appStore = createStore(
  devtools(
    (set, get) => ({
      ...initialState(),

      actions: {
        // call when video onLoadedData event fires
        // store the video ref node, calulate starting points form metadata
        setVideoLoaded: (videoRef, frameHeight = window.innerHeight) => {
          const node = videoRef.current;
          const duration = node.duration;

          set({
            isLoaded: true,
            $video: node,
            duration,
            totalFrames: Math.floor(duration * frameRate)
          });
          // set the total scroll height
          get().actions.setSrollHeight(frameHeight);
        },

        // internal method for calculating the total height
        // you can prob hack tricks with this
        setSrollHeight: (frameHeight = window.innerHeight) => {
          const duration = get().duration;
          const scrollMultiplier = get().scrollMultiplier;

          set({
            frameHeight,
            scrollHeight: Math.floor(
              (duration * frameRate * frameHeight) / scrollMultiplier
            )
          });
        },

        // call on scroll to update calculations
        updateFrame: (scrollPos) => {
          const scrollHeight = get().scrollHeight;
          const totalFrames = get().totalFrames;
          const duration = get().duration;
          const scrollMultiplier = get().scrollMultiplier;

          // calulate where the playhead is at
          // const time = (scrollPos / 100) * get().duration;
          const time = clamp(
            (scrollPos * duration) / scrollHeight,
            0,
            duration
          );
          const currentFrame = clamp(
            Math.floor(time * frameRate),
            0,
            totalFrames
          );
          // percentages
          const percentPlayed = clamp(Math.floor((time / duration) * 100));

          const percentScrolled = clamp(
            Math.floor((scrollPos / scrollHeight) * 100)
          );

          set({
            currentTime: time,
            currentFrame,
            percentPlayed,
            percentScrolled
          });
        },

        // change the scroll multiplier on the fly
        changeSpeed: (scrollMultiplier) => {
          set({
            scrollMultiplier
          });
        },

        // reset the store
        reset: () => set(initialState())
      }
    }),
    {
      name: "appStore"
    }
  )
);

export const useAppStore = (selector) => useStore(appStore, selector);
