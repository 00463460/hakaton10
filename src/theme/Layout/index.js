import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import TranslateButton from '../../components/TranslateButton';

export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <TranslateButton />
    </>
  );
}
