'use client'

import { FC, useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, Variants } from 'framer-motion'
import { usePolymorph } from "@/hooks/use-polymorph";
import { clsx } from "clsx";
import { getRandomInteger } from "@/utils/get-random-integer";

interface HeroTitleProps {
  text: string;
  wordToHighlight?: string;
}

const heroTitleAnimations = {
  chip: {
    hidden: { opacity: 0, scale: 0.5, rotate: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.7,
        duration: 0.18,
      },
    },
  },
  heading: {
      hidden: {
        y: 50,
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'tween',
          duration: 0.3,
          opacity: {
            duration: 0.6,
          },
        },
      },
    },
} satisfies Record<string, Variants>;

// The possible paths for the chip shapes
const paths = [
  'M0 38.4725L84.2212 0H225.249L284 37.2917L277.231 101.464L234.485 124.23L112.431 101.017L18.1494 131L0 38.4725Z',
  'M0.5 62.5L33 0.5H181L279.985 30L286 74L295.5 113.644L236 146.964L156.731 113.644L47 146.964L0.5 62.5Z',
  'M48.6436 231.814L154.695 262L197.548 182.726L225 59.4533L164.002 10.4665L79.7215 0L0 122.497L48.6436 231.814Z',
  'M0 139.387L112.641 225L181.553 199.572L233 88.4796L181.553 24.547L63.1662 0L0 139.387Z',
];

// The possible fill colors for the chip
const fillColors = [
  'fill-green-500',
  'fill-blue-500',
  'fill-pink-500',
  'fill-yellow-500',
];

export const HeroTitle: FC<HeroTitleProps> = ({ text, wordToHighlight }) => {
  const words = useMemo(() => text.split(' '), [text]);

  // Keeping track of the chip shape, color and word to highlight
  const [pathIndex, setPathIndex] = useState<number>(0);
  const [fillColor, setFillColor] = useState<string>(fillColors[0]);
  const [wordHighlightIndex, setWordHighlightIndex] = useState<number>(0);

  // Keeping track of the chip offset. Initially, this is set to the right edge of the word.
  const [offset, setOffset] = useState<{ top: string; left: string }>({ top: '18%', left: '68%' });

  // This is used to track if the initial animation on page load is complete. We don't want this animation to trigger again when the chip moves.
  const [initialAnimationComplete, setInitialAnimationComplete] = useState<boolean>(false);
  // Keeping track of the animation state to debounce the animation
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);

  // Motion magic
  const progress = useMotionValue(pathIndex);
  const spring = useSpring(progress, { stiffness: 50 });
  const path = usePolymorph(spring, paths);

  useEffect(() => {
    // If a word to highlight is provided, we set it as the initial word to be highlighted. Later, the wordHighlightIndex will be overwritten by the chip animation.
    setWordHighlightIndex(wordToHighlight ? words.indexOf(wordToHighlight) : -1);
  }, [words, wordToHighlight]);

  return (
    <motion.h1 className="flex flex-wrap text-5xl lg:text-6xl xl:text-7xl" variants={heroTitleAnimations.heading}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className={'relative mr-3 md:mr-6 lg:mr-7'}
          data-testid={`hero-title-word-${word}`}
        >
          <span className="relative z-[2]">{word}</span>
          {wordHighlightIndex === index && (
            <motion.div
              layoutId="chip"
              // Disable pointer-events while the animation is in progress. Debounces the animation!
              className={clsx('absolute', { 'pointer-events-none': animationInProgress })}
              style={{ top: offset.top, left: offset.left }}
              onLayoutAnimationComplete={() => {
                // After the animation is complete, we can set the animationInProgress to false to enable pointer-events and allow triggering the animation again.
                setAnimationInProgress(false);
                console.info('LayoutAnimation completed');
              }}
              onLayoutAnimationStart={() => {
                console.info('LayoutAnimation started');
              }}
              // initial and animate prop need to be set again to see initial svg on page return
              initial="hidden"
              animate="visible"
            >
              {/** Hacky: We need to render the SVG twice, once with a high z-index and no opacity so we can react to the HoverStart event. */}
              <motion.svg viewBox="0 0 300 262" className="absolute z-10 h-[1.75em] w-auto opacity-0">
                <motion.path
                  d={path}
                  onHoverStart={() => {
                    // The initialAnimationComplete value must be set here instead of the onAnimationComplete event of the path or else the chip will disappear on hover. ¯\_(ツ)_/¯
                    setInitialAnimationComplete(true);
                    setAnimationInProgress(true);
                    // select a new random word, shape and color for the chip
                    const randomWordIndex = getRandomInteger(0, words.length, [wordHighlightIndex]);
                    const randomPathIndex = getRandomInteger(0, paths.length, [pathIndex]);
                    const randomFillColor = fillColors[getRandomInteger(0, fillColors.length, [fillColors.indexOf(fillColor)])];
                    // set a new random offset for the chip
                    setOffset({
                      top: `${getRandomInteger(-20, -5)}%`,
                      left: `${getRandomInteger(-30, 70)}%`,
                    });
                    setWordHighlightIndex(randomWordIndex);
                    setPathIndex(randomPathIndex);
                    setFillColor(randomFillColor);
                    // trigger the chip shape transition
                    progress.set(randomPathIndex);
                  }} />
              </motion.svg>
              {/** This is the actually visible SVG behind the text. */}
              <motion.svg
                viewBox="0 0 300 262"
                className={clsx('absolute h-[1.75em] w-auto', fillColor)}
                data-testid="chip-b"
              >
                <motion.path d={path} variants={initialAnimationComplete ? undefined : heroTitleAnimations.chip} />
              </motion.svg>
            </motion.div>
          )}
        </motion.span>
      ))}
    </motion.h1>
  );
};
