import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

const ratingDistribution = [
  { stars: 5, percentage: 80 },
  { stars: 4, percentage: 15 },
  { stars: 3, percentage: 3 },
  { stars: 2, percentage: 2 },
  { stars: 1, percentage: 0 },
];

export default function ReviewsPreview({ ratingValue, reviewsCount }) {
  if (!reviewsCount || reviewsCount === 0) return null;

  return (
    <section className="service-detail-page__reviews rounded-2xl border border-slate-200 bg-white p-6">
      <div className="rating-header">
        <div className="rating-number">{ratingValue.toFixed(1)}</div>
        <div className="rating-stars">
          <RatingStars value={ratingValue} count={0} />
        </div>
        <span className="rating-text">Based on {reviewsCount} reviews</span>
      </div>

      <div className="rating-distribution">
        {ratingDistribution.map((dist) => (
          <div key={dist.stars} className="distribution-bar">
            <span className="star-label">{dist.stars}</span>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ width: `${dist.percentage}%` }}
              />
            </div>
            <span className="percentage">{dist.percentage}%</span>
          </div>
        ))}
      </div>

      <div>
        <div className="review-item">
          <div className="review-header">
            <div className="review-author">
              <div className="author-avatar">MK</div>
              <span className="author-name">Markus K.</span>
            </div>
            <span className="review-date">2 weeks ago</span>
          </div>
          <div className="review-stars">
            <RatingStars value={5} count={0} />
          </div>
          <p className="review-text">
            Excellent service. They diagnosed the issue with my X5 quickly and the repair
            was done within the estimated timeframe. Price was fair compared to other
            official dealers.
          </p>
        </div>

        <div className="review-item">
          <div className="review-header">
            <div className="review-author">
              <div className="author-avatar">JS</div>
              <span className="author-name">Julia Schmidt</span>
            </div>
            <span className="review-date">1 month ago</span>
          </div>
          <div className="review-stars">
            <RatingStars value={5} count={0} />
          </div>
          <p className="review-text">
            Good work, friendly staff. Waiting area is clean and has good coffee.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Show all {reviewsCount} reviews
      </button>
    </section>
  );
}
