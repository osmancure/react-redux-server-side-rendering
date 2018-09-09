import React from 'react';
import Home from './client/components/Home';
import Trial from './client/components/Trial';
import { loadData } from './client/components/Trial';

export default [
  {
    component: Home,
    path: '/',
    exact: true
  },
  {
    component: Trial,
    loadData: loadData,
    path: '/trial',
  }
];