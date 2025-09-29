// Exemplo em Node.js/Express
app.get('/api/pontos-turisticos', async (req, res) => {
    try {
        // Chama a API do Google Places
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-1.4557,-48.5044&radius=10000&type=tourist_attraction&key=${GOOGLE_API_KEY}`);
        const data = await response.json();
        
        // Formata os dados conforme esperado pelo frontend
        const pontos = data.results.map(place => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.vicinity,
            rating: place.rating,
            types: place.types,
            photos: place.photos?.map(photo => ({
                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
            })) || [],
            geometry: place.geometry,
            opening_hours: place.opening_hours
        }));
        
        res.json(pontos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pontos turísticos' });
    }
});