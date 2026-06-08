// Unit tests for haversineMetres — pure math, no mocks needed.
import { haversineMetres } from "@/lib/qr/utils";

describe("haversineMetres", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineMetres(0, 0, 0, 0)).toBe(0);
  });

  it("returns 0 for identical non-zero coordinates", () => {
    expect(haversineMetres(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0);
  });

  it("computes ~111.2km for 1 degree of latitude at the equator", () => {
    const d = haversineMetres(0, 0, 1, 0);
    // 1 degree of latitude ≈ 111,195m
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(112_000);
  });

  it("computes ~111.2km for 1 degree of longitude at the equator", () => {
    const d = haversineMetres(0, 0, 0, 1);
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(112_000);
  });

  it("is symmetric — d(A,B) equals d(B,A)", () => {
    const d1 = haversineMetres(51.5, -0.1, 48.8, 2.3);
    const d2 = haversineMetres(48.8, 2.3, 51.5, -0.1);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.01);
  });

  it("London to Paris is between 340km and 350km", () => {
    // London: 51.5074, -0.1278  |  Paris: 48.8566, 2.3522
    // Haversine great-circle ≈ 343.5km
    const d = haversineMetres(51.5074, -0.1278, 48.8566, 2.3522);
    expect(d / 1000).toBeGreaterThan(340);
    expect(d / 1000).toBeLessThan(350);
  });

  it("NYC to Los Angeles is approximately 3,940km", () => {
    // NYC: 40.7128, -74.0060  |  LA: 34.0522, -118.2437
    const d = haversineMetres(40.7128, -74.006, 34.0522, -118.2437);
    expect(d / 1000).toBeCloseTo(3940, -1);
  });

  it("correctly identifies points within QR event radius", () => {
    // Event at (0, 0), radius 200m
    const event = { lat: 0, lng: 0, radius_m: 200 };
    // Point ~100m north — within radius
    const nearby = haversineMetres(event.lat, event.lng, 0.0009, 0);
    expect(nearby).toBeLessThan(event.radius_m);
  });

  it("correctly identifies points outside QR event radius", () => {
    const event = { lat: 0, lng: 0, radius_m: 200 };
    // Point ~1km north — outside radius
    const farAway = haversineMetres(event.lat, event.lng, 0.009, 0);
    expect(farAway).toBeGreaterThan(event.radius_m);
  });

  it("handles negative coordinates (southern hemisphere)", () => {
    // Sydney: -33.8688, 151.2093
    const d = haversineMetres(-33.8688, 151.2093, -33.8688, 151.2093);
    expect(d).toBe(0);
  });

  it("handles the date-line crossing (lng near ±180)", () => {
    // Two points either side of the 180° meridian, close together
    const d = haversineMetres(0, 179.999, 0, -179.999);
    // They are ~0.002° apart in longitude at the equator ≈ 222m
    expect(d).toBeLessThan(300);
  });

  it("returns a positive value for all non-identical inputs", () => {
    expect(haversineMetres(10, 20, 10, 21)).toBeGreaterThan(0);
    expect(haversineMetres(-10, -20, 10, 20)).toBeGreaterThan(0);
  });
});
