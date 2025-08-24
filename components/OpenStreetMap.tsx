import React from "react";
import MapView, { PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

const OSM_TILE_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
type MapViewProps = React.ComponentProps<typeof MapView>;

type OpenStreetMapProps = MapViewProps & {};

const OpenStreetMap = React.forwardRef<MapView, OpenStreetMapProps>(
  ({ provider = PROVIDER_DEFAULT, children, ...props }, ref) => {
    return (
      <MapView ref={ref} provider={provider} {...props}>
        <UrlTile
          urlTemplate={OSM_TILE_TEMPLATE}
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent
          zIndex={0}
        />
        {children}
      </MapView>
    );
  }
);

export default OpenStreetMap;
