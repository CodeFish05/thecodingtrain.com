import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useLocation } from '@reach/router';
import { passiveEventArg } from '../utils';

/**
 * Takes an array of images nodes and makes a hashed object based on their names
 */
export const useImages = (nodes, property = 'name') => {
  return useMemo(() => {
    const images = {};
    for (let i = 0; i < nodes.length; i++) {
      images[nodes[i][property]] = nodes[i].childImageSharp.gatsbyImageData;
    }
    return images;
  }, [nodes, property]);
};

export const filterVideos = (videos, filters) => {
  const { isFiltered, language, topic } = filters;
  if (!isFiltered) return videos;
  return videos.filter(
    (v) =>
      (language === 'all' ||
        language === '' ||
        v.languages.includes(language)) &&
      (topic === 'all' || topic === '' || v.topics.includes(topic))
  );
};

const linkRegEx = /\[[^[\]]*\]\([^()]*\)/g;

export const useLinkParsedText = (text) =>
  useMemo(() => {
    return text.split('\n').map((paragraphText, pIndex) => {
      const result = [];

      let keyIndex = 0;
      let currentIndex = 0;
      let match;
      while ((match = linkRegEx.exec(paragraphText)) !== null) {
        result.push(
          <span key={`${pIndex}-${keyIndex}`}>
            {paragraphText.substring(currentIndex, match.index)}
          </span>
        );
        keyIndex += 1;
        const linkText = match[0].substring(1, match[0].indexOf(']'));
        const linkUrl = match[0].substring(
          match[0].indexOf('(') + 1,
          match[0].indexOf(')')
        );
        result.push(
          <a key={`${pIndex}-${keyIndex}`} href={linkUrl}>
            {linkText}
          </a>
        );
        keyIndex += 1;
        currentIndex = linkRegEx.lastIndex;
      }
      result.push(paragraphText.substring(currentIndex, paragraphText.length));
      return <p key={pIndex}>{result}</p>;
    });
  }, [text]);

const scrollPositions = {};
let lastKey;

// persists scroll position of an element across page refreshes
export const usePersistScrollPosition = (key, _namespace) => {
  const namespace = _namespace || key;

  const ref = useRef(); // the ref
  const frame = useRef(); // internal timer

  // if set, override scrollTop of element on initial load
  useEffect(() => {
    const current = ref.current;

    // save the current scroll position, debounced with requestAnimationFrame
    const onScroll = (e) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        // console.log('setting scroll to', scrollPositions[namespace]);
        scrollPositions[namespace] = e.target.scrollTop;
      });
    };

    if (lastKey !== key) {
      // console.log('resetting scroll');
      scrollPositions[namespace] = 0;
    } else if (scrollPositions[namespace]) {
      // console.log('restoring scroll to', scrollPositions[namespace]);
      current.scrollTop = scrollPositions[namespace];
    }

    lastKey = key;
    current.addEventListener('scroll', onScroll, passiveEventArg);

    return () => {
      current.removeEventListener('scroll', onScroll, passiveEventArg);
    };
  }, [key, namespace]);

  return ref;
};

export const getReadableDate = (dateString) => {
  const [year, month, date] = dateString.split('-');
  const months = {
    '01': 'jan',
    '02': 'feb',
    '03': 'mar',
    '04': 'apr',
    '05': 'may',
    '06': 'jun',
    '07': 'jul',
    '08': 'aug',
    '09': 'sep',
    10: 'oct',
    11: 'nov',
    12: 'dec'
  };
  return `${months[month]} ${date}, ${year}`;
};

/**
 * This hook will return true for the first render on the server and for the
 * first render on the client. Otherwhise, it will return false.
 *
 * This function encapsulates a hook so "rules of hooks" apply to it.
 * @see {@link https://reactjs.org/docs/hooks-rules.html}
 *
 * @return {boolean} true on the first server side and client side render
 */
export const useIsFirstRender = () => {
  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => setIsFirst(false), []);
  return isFirst;
};

/**
 * Returns the challenge part index (0 if the challenge is not multi-part)
 * which has been stored in the `location.state` object using the `Link.state`
 * property.
 * 
 * @returns {number} challenge part index
 */
export const useChallengePartIndex = () => {
  const { state } = useLocation();
  return state?.challengePartIndex ?? 0;
};
