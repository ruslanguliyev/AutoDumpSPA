import { useSearchParams } from "react-router-dom";
import { getAutosByFilters } from "../../api/autos";

export default function SearchResults() {
  const [params] = useSearchParams();

  const filters = {
    brand: params.get("brand") || "",
    model: params.get("model") || "",
    vehicleType: params.get("type") || "",
  };

  const results = getAutosByFilters(filters);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        Search Results ({results.length})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((car) => (
          <div key={car.model} className="border rounded p-4">
            <img src={car.image} alt={car.alt} className="w-full h-40 object-cover rounded" />
            <h2 className="text-lg font-bold mt-2">{car.brand} {car.model}</h2>
            <p className="text-sm text-gray-600 mt-1">{car.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
