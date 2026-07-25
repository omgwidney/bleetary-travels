import { describe, expect, it } from "vitest";
import { filterTrips, trips } from "@/lib/catalog";

describe("filterTrips", () => {
  it("returns the complete prototype catalog without filters", () => {
    expect(filterTrips()).toHaveLength(trips.length);
  });

  it("filters by destination name", () => {
    expect(filterTrips("Bali")).toEqual([
      expect.objectContaining({ destinationSlug: "bali" }),
    ]);
  });

  it("filters by destination slug", () => {
    expect(filterTrips(undefined, "canada")).toEqual([
      expect.objectContaining({ destination: "Banff, Canada" }),
    ]);
  });

  it("returns an empty collection when there is no match", () => {
    expect(filterTrips("Atlantis")).toEqual([]);
  });
});
