import { useEffect } from 'react';
import '../../css/Career/Career.css';

export default function Career() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <main className="career-page">
      <section className="career-empty-state" aria-labelledby="career-empty-heading">
        <div className="career-empty-state__inner">
          <h1 id="career-empty-heading" className="career-empty-message">
            There is no current job opening here on this page
          </h1>
        </div>
      </section>
    </main>
  );
}