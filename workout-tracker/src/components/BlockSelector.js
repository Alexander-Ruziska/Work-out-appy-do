import React from 'react';
import './BlockSelector.css';
import { GiWeightLiftingUp, GiMuscleUp } from 'react-icons/gi';
import { IoMdFitness } from 'react-icons/io';
import { FaDumbbell } from 'react-icons/fa';

function BlockSelector({ blocks, currentBlock, onBlockChange }) {
  const blockIcons = [
    <GiWeightLiftingUp size={32} />,
    <GiMuscleUp size={32} />,
    <IoMdFitness size={32} />,
    <FaDumbbell size={32} />
  ];
  
  return (
    <div className="block-selector-container">
      <div className="block-selector">
        <h3 className="block-selector-title">Select Training Block</h3>
        <div className="block-buttons">
          {blocks.map((block, index) => (
            <button
              key={index}
              className={`block-button ${currentBlock === index ? 'active' : ''}`}
              onClick={() => onBlockChange(index)}
            >
              <div className="block-icon">{blockIcons[index] || <FaDumbbell size={32} />}</div>
              <div className="block-name">{block.name}</div>
              <div className="block-weeks">{block.weeks.length} weeks</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlockSelector;
