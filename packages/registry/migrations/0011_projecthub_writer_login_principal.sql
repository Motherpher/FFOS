-- ProjectHub production writer principal — prepared but deliberately NOLOGIN.
-- This creates no password, no externally usable database identity and no
-- ProjectHub application write admission.
--
-- The role is a backend identity shell only. A later protected L3 step may
-- set LOGIN + password through a secure secret-binding process after source,
-- CDX and rollback canaries are accepted.

DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM pg_catalog.pg_roles
    WHERE rolname='ffos_projecthub_writer_login'
  ) THEN
    CREATE ROLE ffos_projecthub_writer_login
      NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

ALTER ROLE ffos_projecthub_writer_login
  NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

-- The writer identity may SET ROLE to the scoped capability role but must not
-- inherit it implicitly. It is intentionally not a member of the reader role.
GRANT ffos_projecthub_runtime TO ffos_projecthub_writer_login
  WITH INHERIT FALSE, SET TRUE;
REVOKE ffos_projecthub_reader FROM ffos_projecthub_writer_login;

-- Defense in depth: the identity shell itself owns no table or sequence
-- privilege. All ProjectHub access must occur after explicit SET LOCAL ROLE.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projecthub_projects','projecthub_nodes','projecthub_relations',
    'projecthub_events','projecthub_idempotency','projecthub_role_grants'
  ] LOOP
    EXECUTE format(
      'REVOKE ALL PRIVILEGES ON TABLE ffos.%I FROM ffos_projecthub_writer_login',
      t
    );
  END LOOP;
END $$;

REVOKE ALL PRIVILEGES ON SEQUENCE
  ffos.projecthub_projects_row_id_seq,
  ffos.projecthub_nodes_row_id_seq,
  ffos.projecthub_relations_row_id_seq,
  ffos.projecthub_role_grants_row_id_seq
FROM ffos_projecthub_writer_login;

-- Final acceptance invariant at this migration boundary:
-- rolcanlogin=false, rolinherit=false, rolbypassrls=false,
-- membership only in ffos_projecthub_runtime with inherit=false/set=true.
