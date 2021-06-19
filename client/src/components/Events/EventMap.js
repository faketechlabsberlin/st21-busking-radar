import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import selectEvents from '../../filters/events';


const EventMap = ({
    handleMarkerClick,
    newLocation,
    events
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null)
    const [lng, setLng] = useState(13.404954);
    const [lat, setLat] = useState(52.520008);
    const [zoom, setZoom] = useState(11);
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
    useEffect(() => {
        if (map.current) return;
        // map render only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: 11
        });
    }, [events.length])
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    });
    useEffect(() => {
        let eventsLong = [];
        events.map(event => {
            let eventsNumber = 0;
            for (let i = 0; i < events.length; i++) {
                if (events[i].geometry.coordinates[0] === event.geometry.coordinates[0]) {
                    eventsNumber++
                }
            }
            let customMarker = document.createElement('div');
            customMarker.className = 'marker';
            customMarker.addEventListener('click', () => {
                handleMarkerClick(event.geometry.coordinates, event.locationName)
            })
            customMarker.innerHTML = `<span><b> ${eventsNumber} </b></span>`
            let marker = new mapboxgl.Marker(customMarker)
                .setLngLat(event.geometry.coordinates)
                .addTo(map.current)
            for (let i = 0; i < events.length; i++) {
                eventsLong.push(event.geometry.coordinates[0])
            }
            return marker
        })
        //This is not the best code ever, but it works! I could maybe try to improve it later
        map.current._markers.forEach(marker => {
            for (let i = 0; i < eventsLong.length; i++) {
                if (eventsLong.includes(marker._lngLat.lng) === false) {
                    return marker.remove()
                }
            }
        })
    }, [events.length])
    useEffect(() => {
        if (newLocation) {
            let newCostumMarker = document.createElement('div');
            newCostumMarker.className = 'marker';
            newCostumMarker.className = 'newMarker';
            newCostumMarker.innerHTML = `<span></span>`
            const newMarker = new mapboxgl.Marker(newCostumMarker)
                .setLngLat([newLocation.long, newLocation.lat])
                .addTo(map.current)
            return newMarker
        }
    }, newLocation)
    return (
        <div id='events-map' className='events-map'>
            <div id='map-container' ref={mapContainer} className='map-container' />
        </div>
    )
}

export default EventMap;

