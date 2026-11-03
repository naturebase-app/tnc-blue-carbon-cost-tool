"use client";

import { useEffect, useState, useCallback, PropsWithChildren } from "react";

import ReactMapGL, {
  ViewState,
  ViewStateChangeEvent,
  useMap,
} from "react-map-gl";

import { MapEvent } from "mapbox-gl";
import { useDebounce } from "rooks";

import { cn } from "@/lib/utils";

import { DEFAULT_VIEW_STATE, MAPBOX_STYLE } from "@/components/map/constants";

import type { CustomMapProps } from "./types";

export default function Map({
  id = "default",
  children,
  className,
  viewState,
  constrainedAxis,
  initialViewState,
  bounds,
  onMapViewStateChange,
  onLoad,
  ...mapboxProps
}: PropsWithChildren<CustomMapProps>) {
  /**
   * REFS
   */
  const { [id]: mapRef } = useMap();

  /**
   * STATE
   */
  const [localViewState, setLocalViewState] =
    useState<Partial<ViewState> | null>(
      !initialViewState
        ? {
          ...DEFAULT_VIEW_STATE,
          ...viewState,
        }
        : null,
    );
  const [isFlying, setFlying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /**
   * CALLBACKS
   */
  const debouncedViewStateChange = useDebounce(
    (_viewState: Partial<ViewState>) => {
      if (onMapViewStateChange) onMapViewStateChange(_viewState);
    },
    250,
  );

  const handleFitBounds = useCallback(() => {
    if (mapRef && bounds) {
      const { bbox, options } = bounds;
      // enabling fly mode avoids the map to be interrupted during the bounds transition
      setFlying(true);

      mapRef.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        options,
      );
    }
  }, [bounds, mapRef]);

  const handleMapMove = useCallback(
    ({ viewState: _viewState }: ViewStateChangeEvent) => {
      const newViewState = {
        ..._viewState,
        latitude:
          constrainedAxis === "y"
            ? localViewState?.latitude
            : _viewState.latitude,
        longitude:
          constrainedAxis === "x"
            ? localViewState?.longitude
            : _viewState.longitude,
      };
      setLocalViewState(newViewState);
      debouncedViewStateChange(newViewState);
    },
    [
      constrainedAxis,
      localViewState?.latitude,
      localViewState?.longitude,
      debouncedViewStateChange,
    ],
  );

  const handleMapLoad = useCallback(
    (e: MapEvent) => {
      setLoaded(true);

      if (onLoad) {
        onLoad(e);
      }
    },
    [onLoad],
  );

  useEffect(() => {
    if (mapRef && bounds) {
      handleFitBounds();
    }
  }, [mapRef, bounds, handleFitBounds]);

  useEffect(() => {
    setLocalViewState((prevViewState) => ({
      ...prevViewState,
      ...viewState,
    }));
  }, [viewState]);

  useEffect(() => {
    if (!bounds) return undefined;

    const { options } = bounds;
    const animationDuration = options?.duration || 0;
    let timeoutId: number;

    if (isFlying) {
      timeoutId = window.setTimeout(() => {
        setFlying(false);
      }, animationDuration);
    }

    return () => {
      if (timeoutId) {
        window.clearInterval(timeoutId);
      }
    };
  }, [bounds, isFlying]);

  useEffect(() => {
    if (!mapRef || !mapboxProps.interactiveLayerIds?.length) return;

    const setPointerStyle = () => {
      mapRef.getCanvas().style.cursor = "pointer";
    };

    const removePointerStyle = () => {
      mapRef.getCanvas().style.cursor = "";
    };

    mapboxProps.interactiveLayerIds.forEach((layerId) => {
      mapRef.on("mouseenter", layerId, setPointerStyle);
      mapRef.on("mouseleave", layerId, removePointerStyle);
    });

    return () => {
      if (!mapRef || !mapboxProps.interactiveLayerIds?.length) return;

      mapboxProps.interactiveLayerIds.forEach((layerId) => {
        mapRef.off("mouseenter", layerId, setPointerStyle);
        mapRef.off("mouseleave", layerId, removePointerStyle);
      });
    };
  }, [mapRef, mapboxProps]);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

  if (!mapboxAccessToken) {
    return <div className={cn("relative z-0 h-full w-full", className)} />;
  }

  return (
    <div className={cn("relative z-0 h-full w-full", className)}>
      <ReactMapGL
        id={id}
        initialViewState={initialViewState}
        mapboxAccessToken={mapboxAccessToken}
        onMove={handleMapMove}
        onLoad={handleMapLoad}
        mapStyle={MAPBOX_STYLE}
        {...mapboxProps}
        {...localViewState}
      >
        {!!mapRef && loaded && children}
      </ReactMapGL>
    </div>
  );
}
