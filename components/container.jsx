import React from 'react';

const Container = ({ children }) => (
  <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center justify-center h-full">
    {children}
  </div>
);

export default Container;
