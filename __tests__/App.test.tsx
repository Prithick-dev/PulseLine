/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/app/Navigator', () => {
  const React = require('react');
  const {Text} = require('react-native');

  return {
    Navigator: () => <Text>Mock Navigator</Text>,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
