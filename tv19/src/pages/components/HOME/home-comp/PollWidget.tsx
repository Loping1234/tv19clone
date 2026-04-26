import React, { useState, useEffect } from 'react';
import './PollWidget.css';

const API = 'http://localhost:5000';

interface PollOption {
  _id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: boolean;
}

const PollWidget: React.FC = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/polls/active`)
      .then(res => res.ok ? res.json() : null)
      .then((data: Poll | null) => {
        if (!data) return;
        setPoll(data);
        // Check if user already voted on this poll
        const voted = localStorage.getItem(`tv19_poll_${data._id}`);
        if (voted) {
          setHasVoted(true);
          setSelectedOptionId(voted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (optionId: string) => {
    if (hasVoted || !poll) return;

    try {
      const res = await fetch(`${API}/api/polls/${poll._id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) return;
      const updated: Poll = await res.json();
      setPoll(updated);
      setSelectedOptionId(optionId);
      setHasVoted(true);
      localStorage.setItem(`tv19_poll_${poll._id}`, optionId);
    } catch {}
  };

  if (loading) return null;
  if (!poll) return null;

  const totalVotes = poll.totalVotes || poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="poll-widget-container">
      <div className="poll-header">
        <i className="fas fa-poll-h"></i>
        <h3>TV19 POLL OF THE DAY</h3>
      </div>

      <div className="poll-question">{poll.question}</div>

      <div className="poll-options">
        {poll.options.map(option => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

          return (
            <div
              key={option._id}
              className={`poll-option ${hasVoted ? 'voted-mode' : ''} ${selectedOptionId === option._id ? 'selected' : ''}`}
              onClick={() => handleVote(option._id)}
            >
              {!hasVoted ? (
                <>
                  <div className="poll-radio-outer">
                    <div className="poll-radio-inner"></div>
                  </div>
                  <span className="poll-label">{option.text}</span>
                </>
              ) : (
                <div className="poll-result-bar-wrapper">
                  <div className="poll-result-bar" style={{ width: `${percent}%` }}></div>
                  <div className="poll-result-content">
                    <span className="poll-label">
                      {option.text} {selectedOptionId === option._id && <i className="fas fa-check-circle"></i>}
                    </span>
                    <span className="poll-percent">{percent}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <div className="poll-total-votes">
          Total Votes: {totalVotes.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PollWidget;
