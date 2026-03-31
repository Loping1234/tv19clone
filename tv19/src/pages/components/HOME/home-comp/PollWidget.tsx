import React, { useState } from 'react';
import '../../../css/HOME/home-comp/PollWidget.css';

const PollWidget: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  const pollQuestion = "Which news category interests you the most?";
  const options = [
    { id: 'politics', label: 'Politics & Governance', votes: 342 },
    { id: 'technology', label: 'Technology & Innovation', votes: 287 },
    { id: 'sports', label: 'Sports & Fitness', votes: 198 },
    { id: 'entertainment', label: 'Entertainment & Culture', votes: 256 },
  ];

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = () => {
    if (selected) setVoted(true);
  };

  return (
    <div className="poll-widget">
      <div className="poll-widget__header">
        <i className="fas fa-poll"></i>
        <span>POLL</span>
      </div>

      <div className="poll-widget__body">
        <h4 className="poll-widget__question">{pollQuestion}</h4>

        <div className="poll-widget__options">
          {options.map((option) => (
            <label
              key={option.id}
              className={`poll-option ${selected === option.id ? 'poll-option--selected' : ''} ${voted ? 'poll-option--voted' : ''}`}
            >
              {!voted ? (
                <>
                  <input
                    type="radio"
                    name="poll"
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    className="poll-option__radio"
                  />
                  <span className="poll-option__label">{option.label}</span>
                </>
              ) : (
                <>
                  <div
                    className="poll-option__bar"
                    style={{ width: `${Math.round((option.votes / totalVotes) * 100)}%` }}
                  />
                  <span className="poll-option__label">{option.label}</span>
                  <span className="poll-option__percent">
                    {Math.round((option.votes / totalVotes) * 100)}%
                  </span>
                </>
              )}
            </label>
          ))}
        </div>

        {!voted ? (
          <button
            className="poll-widget__vote-btn"
            onClick={handleVote}
            disabled={!selected}
          >
            VOTE NOW
          </button>
        ) : (
          <p className="poll-widget__total">{totalVotes} votes</p>
        )}
      </div>
    </div>
  );
};

export default PollWidget;
