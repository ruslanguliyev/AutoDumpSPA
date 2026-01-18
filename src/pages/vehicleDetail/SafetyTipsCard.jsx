import { ShieldCheck } from "lucide-react";

const SafetyTipsCard = ({ tips }) => (
  <div className="safety-tips">
    <h3 className="section-title">
      <ShieldCheck size={18} aria-hidden="true" />
      Safety Tips
    </h3>
    <ul>
      {tips.map((tip) => (
        <li key={tip}>{tip}</li>
      ))}
    </ul>
  </div>
);

export default SafetyTipsCard;

