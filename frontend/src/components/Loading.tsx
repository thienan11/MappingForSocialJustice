import React from 'react';

const Loading: React.FC = () => (
  <div className='w-full'>
      <div className='h-1.5 w-full bg-pink-100 overflow-hidden'>
        <div className='progress w-full h-full bg-red-500 left-right'></div>
      </div>
</div>
);

export default Loading;
