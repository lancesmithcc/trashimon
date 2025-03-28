import React, { useState } from 'react';
import Map from './components/Map';
import TrashForm from './components/TrashForm';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 0, lng: 0 });

  return (
    <div className="relative">
      <Map />
      {showForm && (
        <TrashForm
          onClose={() => setShowForm(false)}
          location={selectedLocation}
        />
      )}
    </div>
  );
}

export default App;