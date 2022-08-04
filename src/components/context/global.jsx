import { createContext } from 'react';

export const screenSizes = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200,
};


export const UserContext = createContext({
  userData: {},
});

export const ThemeContext = createContext({
  animationSpeed: 300,
  screenSizes,
  footer: {
    rightText: '',
    copyrightLink: 'http://gregorybrewster.com',
    copyrightName: 'Greg Brewster',
    copyrightYear: '2022',
  },
});
