-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Create the function to get nearby toilets
CREATE OR REPLACE FUNCTION get_nearby_toilets(
  lat double precision,
  lng double precision,
  radius_miles double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  latitude double precision,
  longitude double precision,
  distance double precision,
  is_paid boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.address,
    t.latitude,
    t.longitude,
    (point(t.longitude, t.latitude) <@> point(lng, lat)) * 69.0 as distance, -- Convert degrees to miles
    t.is_paid
  FROM toilets t
  WHERE (point(t.longitude, t.latitude) <@> point(lng, lat)) * 69.0 <= radius_miles
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql; 