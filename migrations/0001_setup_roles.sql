CREATE ROLE app_runtime LOGIN;
ALTER ROLE app_runtime PASSWORD 'devpassword';
ALTER ROLE app_runtime
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;


CREATE ROLE app_guest NOLOGIN;
CREATE ROLE app_authenticated NOLOGIN;

GRANT app_guest TO app_runtime;
GRANT app_authenticated TO app_runtime;

-- Both application roles may enter app_auth
GRANT USAGE ON SCHEMA app_auth TO app_guest;
GRANT USAGE ON SCHEMA app_auth TO app_authenticated;

-- Guest: registration
GRANT INSERT (
  username,
  email,
  password_hash,
  first_name,
  last_name
)
ON app_auth."user"
TO app_guest;

-- Guest: login
GRANT SELECT (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  token_version,
  created_at,
  updated_at
)
ON app_auth."user"
TO app_guest;

-- Guest: refresh
GRANT UPDATE (token_version)
ON app_auth."user"
TO app_guest;

-- Authenticated: read and delete own row
GRANT SELECT, DELETE
ON app_auth."user"
TO app_authenticated;

-- Authenticated: update allowed fields
GRANT UPDATE (
  username,
  email,
  password_hash,
  first_name,
  last_name,
  token_version,
  updated_at
)
ON app_auth."user"
TO app_authenticated;


