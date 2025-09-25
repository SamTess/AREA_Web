// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, ...props }: any) =>
    React.createElement('img', { src, alt, width, height, ...props }),
}))

jest.mock('@mantine/carousel', () => ({
  Carousel: Object.assign(
    ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel' }, children),
    {
      Slide: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel-slide' }, children),
    }
  ),
}))

jest.mock('embla-carousel-autoplay', () => jest.fn(() => ({})))