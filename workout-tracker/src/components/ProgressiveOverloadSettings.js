import React, { useState } from 'react';
import { BiX } from 'react-icons/bi';
import './ProgressiveOverloadSettings.css';

function ProgressiveOverloadSettings({ settings, onSave, onClose, onEnableWithReview }) {
  const [isEnabled, setIsEnabled] = useState(settings.isOverloadEnabled || false);
  const [percentage, setPercentage] = useState(settings.overloadPercentage || 4);
  const [interval, setInterval] = useState(settings.overloadInterval || 1);
  const [resetOnBlock, setResetOnBlock] = useState(settings.resetOnBlockChange || false);

  const handleToggleEnable = (checked) => {
    setIsEnabled(checked);
    
    // If toggling (either ON or OFF) and there's a callback for review, trigger it
    if (checked !== settings.isOverloadEnabled && onEnableWithReview) {
      const newSettings = {
        isOverloadEnabled: checked,
        overloadPercentage: parseFloat(percentage),
        overloadInterval: parseInt(interval),
        resetOnBlockChange: resetOnBlock
      };
      onEnableWithReview(newSettings);
    }
  };

  const handleSave = () => {
    const newSettings = {
      isOverloadEnabled: isEnabled,
      overloadPercentage: parseFloat(percentage),
      overloadInterval: parseInt(interval),
      resetOnBlockChange: resetOnBlock
    };
    
    // If progressive overload state changed (enabled or disabled), trigger review
    if (isEnabled !== settings.isOverloadEnabled && onEnableWithReview) {
      onEnableWithReview(newSettings);
    } else {
      // Otherwise just save normally (only settings changed, not enabled state)
      onSave(newSettings);
      onClose();
    }
  };

  // Example calculation
  const exampleLoad = 100;
  const calculatedLoad = (exampleLoad * (1 + percentage / 100)).toFixed(1);

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Progressive Overload Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <BiX size={24} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => handleToggleEnable(e.target.checked)}
              />
              <span className="toggle-text">Enable Progressive Overload</span>
            </label>
          </div>

          <div className="setting-group">
            <label>
              Percentage Increase
              <div className="input-with-unit">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  disabled={!isEnabled}
                />
                <span className="unit">%</span>
              </div>
            </label>
            <p className="hint">How much to increase load each interval</p>
          </div>

          <div className="setting-group">
            <label>
              Apply Increase Every
              <div className="input-with-unit">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  disabled={!isEnabled}
                />
                <span className="unit">week(s)</span>
              </div>
            </label>
            <p className="hint">How often to apply the increase</p>
          </div>

          <div className="setting-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={resetOnBlock}
                onChange={(e) => setResetOnBlock(e.target.checked)}
                disabled={!isEnabled}
              />
              <span className="toggle-text">Reset progression on new block</span>
            </label>
            <p className="hint">Start progression from scratch when changing blocks</p>
          </div>

          <div className="preview-section">
            <h3>Example Calculation</h3>
            <p className="preview-text">
              If you lift <strong>{exampleLoad} lbs</strong> in Week 1,
              {interval === 1 ? (
                <> Week 2 will suggest <strong>{calculatedLoad} lbs</strong></>
              ) : (
                <> Week {parseInt(interval) + 1} will suggest <strong>{calculatedLoad} lbs</strong></>
              )}
            </p>
            <p className="preview-formula">
              Formula: {exampleLoad} × (1 + {percentage}%) = {calculatedLoad}
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressiveOverloadSettings;
