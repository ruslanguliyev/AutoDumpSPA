import AutoCard from '../../components/CardComponents/AutoCard.jsx';
import { useAuto } from '../../context/AutoContext';
import './Home.scss';

export default function Home() {
  const { autos } = useAuto();

  return (
    <div className="home">
      <div className="home__container">
        <div className="home__grid">
          {autos.map((car, i) => (
            <AutoCard key={i} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
