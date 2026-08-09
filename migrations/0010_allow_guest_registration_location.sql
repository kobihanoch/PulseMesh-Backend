-- Public registration may optionally include the registrant's current location.
GRANT INSERT (latitude, longitude, last_location_at)
ON registry.registrant TO app_guest;
