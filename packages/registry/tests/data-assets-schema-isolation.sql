-- Test against throwaway PostgreSQL only. No production statements.
CREATE SCHEMA twin_fixture;
CREATE TABLE twin_fixture.untouched(id integer PRIMARY KEY, payload text NOT NULL);
INSERT INTO twin_fixture.untouched VALUES (1,'DO_NOT_TOUCH');

INSERT INTO ffos.data_work_orders
  (work_order_id,request_id,owner_repo,purpose,authority_ref,requirements,created_at,created_by)
VALUES ('wo-test','req-test','Motherpher/FFOS','isolated registry test','TEST_ONLY',
        '{"area":"0380"}','2026-11-16T00:00:00Z','ci');

INSERT INTO ffos.data_asset_versions
 (asset_version_id,asset_id,owner_repo,asset_kind,schema_ref,location_ref,content_sha256,
 source_as_of,validity,compatibility,license_ref,qa_receipt_ref,source_refs,registered_by)
VALUES ('asset-v1','asset','Motherpher/FF-Spatial','SPATIAL_BASE','fixture/v1','fixture://not-a-real-layer',
        repeat('a',64),'2026-10-01T00:00:00Z','{"vintage":"2018"}','{"area":"0380"}',
        'test-only','qa-test','["source-test"]','ci');

INSERT INTO ffos.data_reuse_decisions
 (decision_id,work_order_id,decision,candidates,selected_asset_version_ids,rationale,evidence_refs,decided_by,decided_at)
VALUES ('reuse-test','wo-test','REUSE_EXACT','["asset-v1"]','["asset-v1"]',
        'synthetic fixture only','["qa-test"]','ci','2026-11-16T00:00:00Z');

INSERT INTO ffos.data_work_order_asset_links
 (link_id,work_order_id,asset_version_id,role,run_id,receipt_ref)
VALUES ('link-test','wo-test','asset-v1','REUSED','run-test','qa-test');

DO $$
DECLARE n integer; t text; blocked boolean;
BEGIN
  SELECT count(*) INTO n FROM twin_fixture.untouched WHERE id=1 AND payload='DO_NOT_TOUCH';
  IF n<>1 THEN RAISE EXCEPTION 'Twin fixture was altered'; END IF;

  SELECT count(*) INTO n FROM information_schema.tables
   WHERE table_schema='public' AND table_name IN
     ('data_work_orders','data_asset_versions','data_reuse_decisions','data_work_order_asset_links');
  IF n<>0 THEN RAISE EXCEPTION 'FFOS tables escaped dedicated schema'; END IF;

  SELECT count(*) INTO n FROM information_schema.tables
   WHERE table_schema='ffos' AND table_name IN
     ('data_work_orders','data_asset_versions','data_reuse_decisions','data_work_order_asset_links');
  IF n<>4 THEN RAISE EXCEPTION 'Dedicated FFOS table set incomplete'; END IF;

  FOREACH t IN ARRAY ARRAY['data_work_orders','data_asset_versions',
                           'data_reuse_decisions','data_work_order_asset_links'] LOOP
    EXECUTE format('SELECT count(*) FROM ffos.%I', t) INTO n;
    IF n<>1 THEN RAISE EXCEPTION 'Missing fixture %',t; END IF;
    blocked:=false;
    BEGIN
      EXECUTE format('DELETE FROM ffos.%I',t);
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM LIKE 'FFOS registry is append-only:%' THEN blocked:=true; ELSE RAISE; END IF;
    END;
    IF NOT blocked THEN RAISE EXCEPTION 'Missing immutable DELETE on %',t; END IF;
  END LOOP;
  blocked:=false;
  BEGIN
    UPDATE ffos.data_work_orders SET purpose='tamper' WHERE work_order_id='wo-test';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'FFOS registry is append-only:%' THEN blocked:=true; ELSE RAISE; END IF;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Missing immutable UPDATE'; END IF;
END;
$$;
