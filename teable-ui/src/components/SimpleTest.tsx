import React from 'react';

const SimpleTest: React.FC = () => {
  return React.createElement('div', null, 
    React.createElement('h1', null, 'Simple Test'),
    React.createElement('p', null, 'This is a simple test component')
  );
};

export default SimpleTest;
