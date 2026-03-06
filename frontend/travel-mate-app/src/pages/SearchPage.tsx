//V's_new_start
import { useQuery } from '@tanstack/react-query';

// A simple Logic-First Component to test the $near GeoJSON queries
export const SearchPage = () => {
    // Hardcoded coordinates to test logic
    const lat = 12.97;
    const lng = 77.59;

    const fetchNearbyHotels = async () => {
        // In a real app we would have an axios instance, let's use fetch for simplicity
        const response = await fetch(`http://localhost:5000/api/v1/hotels/nearby?lng=${lng}&lat=${lat}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['nearbyHotels', lng, lat],
        queryFn: fetchNearbyHotels,
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search & Discovery (Geo-Spatial Test)</h1>
            <div className="mb-4 text-sm text-gray-600">
                Testing $near queries for coordinates: [{lng}, {lat}]
            </div>

            {isLoading && <p>Loading nearby hotels...</p>}
            {error && <p className="text-red-500">Error fetching hotels: {error.message}</p>}

            <div className="grid gap-4">
                {data && data.length === 0 && <p>No hotels found near this location.</p>}
                {data && data.map((hotel: any) => (
                    <div key={hotel._id || hotel.hotelId} className="border p-4 rounded-md shadow-sm">
                        <h2 className="text-lg font-semibold">{hotel.name}</h2>
                        <p className="text-sm">Distance: (Render geo distance here)</p>
                        <p className="text-sm text-gray-500">{hotel.address?.city}, {hotel.address?.country}</p>
                    </div>
                ))}
            </div>
            {/* 
 * Testing Checklist:
 * [ ] Verify the backend GET endpoint /api/v1/hotels/nearby triggers `getHotelsNearLocation` service.
 * [ ] Confirm data returns only hotels within the maxDistance logic.
 */}
        </div>
    );
};
//V's_new_end
