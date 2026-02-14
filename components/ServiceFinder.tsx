import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Navigation, Clock } from 'lucide-react';
import { MOCK_SERVICE_CENTERS } from '../constants';
import { ServiceCenter } from '../types';

const ServiceFinder: React.FC = () => {
  const [centers, setCenters] = useState<ServiceCenter[]>(MOCK_SERVICE_CENTERS);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // In a real app, we would fetch centers based on these coords from an API
          // Here we just simulate a delay
          setTimeout(() => setLoading(false), 1000);
        },
        (error) => {
          console.error("Error getting location", error);
          setLoading(false);
          alert("Could not access location. Showing default centers.");
        }
      );
    } else {
      setLoading(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    // Auto request on mount for demo
    requestLocation();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-heading font-bold text-primary mb-2">Service Centers</h2>
           <p className="text-slate-500">Find authorized repair centers near you.</p>
        </div>
        <button 
            onClick={requestLocation}
            className="flex items-center text-cta font-semibold hover:text-accent transition-colors"
        >
            <Navigation size={18} className="mr-2" />
            Update Location
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-slate-200 rounded-xl min-h-[400px] relative overflow-hidden group">
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-118.2437,34.0522,12,0/800x600?access_token=Pk.mock')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" style={{backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=34.0522,-118.2437&zoom=12&size=800x600&sensor=false&key=YOUR_API_KEY_HERE_MOCK')`}}></div>
            {/* Fallback pattern if no internet for image */}
            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center opacity-100 -z-10">
                <MapPin size={48} className="text-slate-400" />
            </div>

            {/* Pins */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <span className="absolute -top-10 -left-6 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-primary whitespace-nowrap">You are here</span>
                    <div className="w-4 h-4 bg-cta rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                </div>
            </div>
        </div>

        {/* List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta"></div>
                    <p className="mt-2 text-slate-500">Locating...</p>
                </div>
            ) : centers.map(center => (
                <div key={center.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-primary">{center.name}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{center.distanceKm} km</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-500 mb-3 space-x-2">
                         <MapPin size={16} className="mt-0.5 shrink-0" />
                         <span>{center.address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center text-amber-500 text-sm font-bold">
                            <Star size={14} className="fill-current mr-1" />
                            {center.rating}
                        </div>
                         <div className="flex items-center text-slate-400 text-xs">
                            <Clock size={14} className="mr-1" />
                            {center.hours.split(':')[0]}
                        </div>
                        <a href={`tel:${center.phone}`} className="ml-auto flex items-center text-cta hover:text-accent text-sm font-semibold">
                            <Phone size={14} className="mr-1" />
                            Call
                        </a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceFinder;
