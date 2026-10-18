import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  validateCoordinates,
} from "@/lib/location";
import {
  calculateFreshnessStatus,
  normalizePersianText,
} from "@/lib/search";

describe("Phase 3 — Location Distance & Search Utilities", () => {
  it("validates latitude and longitude physical bounds", () => {
    expect(validateCoordinates(35.7592, 51.4056)).toBe(true); // Tehran
    expect(validateCoordinates(100, 51.4056)).toBe(false); // Invalid lat
    expect(validateCoordinates(35.7592, 200)).toBe(false); // Invalid lng
  });

  it("calculates accurate Haversine distance in kilometers", () => {
    const vanak = { latitude: 35.7592, longitude: 51.4056 };
    const enghelab = { latitude: 35.7008, longitude: 51.3912 };

    const dist = calculateHaversineDistanceKm(vanak, enghelab);
    expect(dist).toBeGreaterThan(6);
    expect(dist).toBeLessThan(8);
  });

  it("normalizes Persian characters for consistent search", () => {
    expect(normalizePersianText("استامينوفن")).toBe("استامینوفن"); // Arabic ye to Persian ye
    expect(normalizePersianText("كپسل")).toBe("کپسل"); // Arabic kaf to Persian kaf
    expect(normalizePersianText(" آسپیرین ")).toBe("اسپیرین"); // Alef with madda
  });

  it("calculates inventory freshness status correctly", () => {
    const now = new Date();
    const freshDate = new Date(now.getTime() - 2 * 24 * 3600 * 1000); // 2 days old
    const staleDate = new Date(now.getTime() - 10 * 24 * 3600 * 1000); // 10 days old

    expect(calculateFreshnessStatus(freshDate, 10, true)).toBe("AVAILABLE");
    expect(calculateFreshnessStatus(staleDate, 10, true)).toBe("STALE");
    expect(calculateFreshnessStatus(freshDate, 0, true)).toBe("UNAVAILABLE");
    expect(calculateFreshnessStatus(freshDate, 10, false)).toBe("UNAVAILABLE");
  });
});
