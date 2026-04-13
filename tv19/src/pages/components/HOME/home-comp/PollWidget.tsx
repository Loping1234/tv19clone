import React, { useState, useEffect } from 'react';
import './PollWidget.css';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

interface PollState {
  hasVoted: boolean;
  selectedOptionId: string | null;
  options: PollOption[];
}

const DEFAULT_OPTIONS: PollOption[] = [
  { id: '1', label: 'Yes', votes: 1450 },
  { id: '2', label: 'No', votes: 820 },
  { id: '3', label: "Can't Say", votes: 340 }
];

const PollWidget: React.FC = () => {
  const [poll, setPoll] = useState<PollState>({
    hasVoted: false,
    selectedOptionId: null,
    options: DEFAULT_OPTIONS
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tv19_poll_voted');
    if (saved) {
      const data = JSON.parse(saved);
      setPoll(prev => ({
        ...prev,
        hasVoted: true,
        selectedOptionId: data.selectedId,
        options: prev.options.map(opt => 
          opt.id === data.selectedId ? { ...opt, votes: opt.votes + 1 } : opt
        )
      }));
    }
  }, []);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (optionId: string) => {
    if (poll.hasVoted) return;

    // Save vote to local storage
    localStorage.setItem('tv19_poll_voted', JSON.stringify({ selectedId: optionId }));

    // Update state to show results
    setPoll(prev => ({
      hasVoted: true,
      selectedOptionId: optionId,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
  };

  return (
    <div className="poll-widget-container">
      <div className="poll-header">
        <i className="fas fa-poll-h"></i>
        <h3>TV19 POLL OF THE DAY</h3>
      </div>
      
      <div className="poll-question">
        Do you think the new National Education Policy will drastically improve employment rates?
      </div>

      <div className="poll-options">
        {poll.options.map(option => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          
          return (
            <div 
              key={option.id} 
              className={`poll-option ${poll.hasVoted ? 'voted-mode' : ''} ${poll.selectedOptionId === option.id ? 'selected' : ''}`}
              onClick={() => handleVote(option.id)}
            >
              {!poll.hasVoted ? (
                <>
                  <div className="poll-radio-outer">
                    <div className="poll-radio-inner"></div>
                  </div>
                  <span className="poll-label">{option.label}</span>
                </>
              ) : (
                <div className="poll-result-bar-wrapper">
                  <div 
                    className="poll-result-bar" 
                    style={{ width: `${percent}%` }}
                  ></div>
                  <div className="poll-result-content">
                    <span className="poll-label">
                      {option.label} {poll.selectedOptionId === option.id && <i className="fas fa-check-circle"></i>}
                    </span>
                    <span className="poll-percent">{percent}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {poll.hasVoted && (
        <div className="poll-total-votes">
          Total Votes: {totalVotes.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PollWidget;
