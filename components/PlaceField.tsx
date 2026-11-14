"use client";

// Text field with place suggestions loaded from GET /api/places as the user types.
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { fetchPlaces } from "@/lib/api";
import type { Place } from "@/lib/types";

interface PlaceFieldProps {
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  error?: string;
}

export default function PlaceField({ label, value, onChange, error }: PlaceFieldProps) {
  const [input, setInput] = useState(value?.name ?? "");
  const [options, setOptions] = useState<Place[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const controller = new AbortController();
    // Once a place is chosen the box shows its name; list every place again so it is easy to change.
    const query = value && input === value.name ? "" : input;
    const timer = setTimeout(() => {
      fetchPlaces(query, controller.signal)
        .then((places) => {
          setOptions(places);
          setStatus("ready");
        })
        .catch((reason: unknown) => {
          if ((reason as Error).name !== "AbortError") setStatus("failed");
        });
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [input, value]);

  const failed = status === "failed";
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      openOnFocus
      options={options}
      value={value}
      inputValue={input}
      loading={status === "loading"}
      filterOptions={(all) => all}
      getOptionLabel={(place) => place.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={failed ? "Places could not be loaded." : "No matching place. Try a station, street or landmark."}
      onChange={(_, place) => onChange(place)}
      onInputChange={(_, text) => {
        setStatus("loading");
        setInput(text);
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
          helperText={error ?? (failed ? "We couldn't load places. Check your connection and type again." : " ")}
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
