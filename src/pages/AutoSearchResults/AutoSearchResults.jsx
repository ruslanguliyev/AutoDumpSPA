import { useSearchParams } from "react-router-dom";
import { getAutosByFilters } from "../../api/autos";
import AutoCard from "../../components/AutoCardComponent/AutoCard";
import SearchFilter from "../../components/AutoSearchFilter/AutoSearchFilter";
import BackButton from '../../components/BackButton/BackButton'
import './AutoSearchResult.scss'

export default function AutoSearchResults() {
  const [params] = useSearchParams();

  const filters = {
    brand: params.get("brand") || "",
    model: params.get("model") || "",
    vehicleType: params.get("type") || "",
    region: params.get("region") || "",
  };

  const results = getAutosByFilters(filters);

  return (
    <div className="container mx-auto p-6 space-y-8">

      <div className="back_button d-flex align-items-start">
        <BackButton />
      </div>
      {/* 🔍 SEARCH FILTER */}
      <SearchFilter />

      {/* 🧠 TITLE */}
      <h1 className="text-xl font-semibold">
        Search Results {results.length}
      </h1>

      {/* 🚗 RESULTS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {results.map((car) => (
          <AutoCard key={car.id} car={car} />
        ))}
      </div>

    </div>
  );
}
