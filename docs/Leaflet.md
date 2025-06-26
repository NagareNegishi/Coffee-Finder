To enhance UI, we will use Leaflet, a JavaScript library for interactive maps.

## Leaflet
- [Quick Start Guide: ](https://leafletjs.com/examples/quick-start/)
- [API Reference:](https://leafletjs.com/reference.html)


## how to show all markers on the map

**FeatureGroup:**
Extended LayerGroup that makes it easier to do the same thing to all its member layers: 

- bindPopup binds a popup to all of the layers at once (likewise with bindTooltip)
- Events are propagated to the FeatureGroup, so if the group has an event handler, it will handle events from any of the layers. This includes mouse events and custom events.
- Has layeradd and layerremove events

**LatLngBounds:**
- Represents a rectangular geographical area on a map.

1. create a FeatureGroup
2. FeatureGroup has getBounds() method that returns the LatLngBounds of the Feature Group
3. use fitBounds() method to set the map view that contains the bound from step 2



getBounds()	LatLngBounds
Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).

fitBounds(<LatLngBounds> bounds, <fitBounds options> options?)	this
Sets a map view that contains the given geographical bounds with the maximum zoom level possible.