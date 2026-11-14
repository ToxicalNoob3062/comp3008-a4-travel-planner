"use client";

// Text field with place suggestions. The list of places is loaded once from GET /api/places
// and filtered in the browser as the user types, so suggestions appear without a network wait.
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import DropInPopper from "@/components/motion/DropInPopper";
import { fetchPlaces, filterPlaces } from "@/lib/api";
import type { Place } from "@/lib/types";

interface PlaceFieldProps {
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  error?: string;
}

export default function PlaceField({ label, value, onChange, error }: PlaceFieldProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchPlaces()
      .then((list) => {
        if (!active) return;
        setPlaces(list);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("failed");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const failed = status === "failed";
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      openOnFocus
      options={places}
      // The suggestions drop in from the field and fade out when they close, like the calendar.
      slots={{ popper: DropInPopper }}
      value={value}
      loading={status === "loading"}
      // Once a place is chosen the box shows its name; list every place again so it is easy to change.
      filterOptions={(all, { inputValue }) => filterPlaces(all, value && inputValue === value.name ? "" : inputValue)}
      getOptionLabel={(place) => place.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={failed ? "Places could not be loaded." : "No matching place. Try a station, street or landmark."}
      onChange={(_, place) => onChange(place)}
      onOpen={() => {
        // A failed load is tried again the next time the list opens.
        if (failed) {
          setStatus("loading");
          setAttempt((n) => n + 1);
        }
      }}
      renderOption={({ key, ...props }, place) => (
        <li key={key} {...props}>
          <div className="flex flex-col gap-0.5 py-1">
            <span className="text-base font-medium text-ink">{place.name}</span>
            <span className="text-[13px] text-muted">{place.subtitle}</span>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="standard"
          placeholder="Type a station, street or place"
          error={!!error || failed}
          helperText={error ?? (failed ? "We couldn't load places. Check your connection and open the list again." : " ")}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              endAdornment: (
                <>
                  {status === "loading" ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.slotProps?.input?.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
