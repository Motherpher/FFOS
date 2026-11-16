-- Integration smoke tests run only against temporary PostgreSQL service in GitHub Actions.
-- Non-sensitive synthetic identifiers; no external data, credentials, or runtime.
begin;
insert into ffos_data_work_orders
 (work_order_id,request_id,owner_repo,purpose,authority_ref,requirements,created_at,created_by)
values
 ('test-wo-001','test-req-001','Motherpher/FFOS','fixture: retain a typed work order',
  'TEST_AUTHORITY_ONLY','{"geography_id":"0380","geography_vintage":"2018"}'::jsonb,
  '2026-11-16T00:00:00Z','test-runner');

insert into ffos_data_asset_versions
 (asset_version_id,asset_id,owner_repo,asset_kind,schema_ref,location_ref,content_sha256,
 source_as_of,validity,compatibility,license_ref,qa_receipt_ref,source_refs,registered_by)
values
 ('test-deso-v1','test-deso','Motherpher/FF-Spatial','SPATIAL_BASE','spatial-product-v1',
  'fixture://not-a-real-layer',repeat('a',64),'2026-10-01T00:00:00Z',
  '{"vintage":"2018"}'::jsonb,'{"geography_id":"0380"}'::jsonb,
  'TEST_LICENSE_ONLY','test-qa-001','["test-official-source"]'::jsonb,'test-runner');

insert into ffos_data_reuse_decisions
 (decision_id,work_order_id,decision,candidates,selected_asset_version_ids,rationale,evidence_refs,decided_by,decided_at)
values
 ('test-dec-001','test-wo-001','REUSE_EXACT',
  '["test-deso-v1"]'::jsonb,'["test-deso-v1"]'::jsonb,
  'fixture verified for registry connectivity, NOT for real GIS',
  '["test-qa-001"]'::jsonb,'test-runner','2026-11-16T00:00:00Z');

insert into ffos_data_work_order_asset_links
 (link_id,work_order_id,asset_version_id,role,run_id,receipt_ref)
values
 ('test-link-001','test-wo-001','test-deso-v1','REUSED','test-run-001','test-qa-001');
commit;

do $$
begin
  if (select count(*) from ffos_data_work_orders) != 1 then
    raise exception 'Expected one persisted work order';
  end if;
  if (select count(*) from ffos_data_asset_versions) != 1 then
    raise exception 'Expected one persisted asset version';
  end if;
  if (select count(*) from ffos_data_reuse_decisions) != 1 then
    raise exception 'Expected one persisted reuse decision';
  end if;
  if (select count(*) from ffos_data_work_order_asset_links) != 1 then
    raise exception 'Expected one persisted work-order asset link';
  end if;
end $$;

-- Each append-only table must reject updates and deletes with the exact trigger
-- message, rather than merely failing due to unrelated SQL errors.
do $$
declare
  tbl text;
  old_count integer;
  blocked boolean;
begin
  foreach tbl in array array[
    'ffos_data_work_orders','ffos_data_asset_versions',
    'ffos_data_reuse_decisions','ffos_data_work_order_asset_links'
  ] loop
    execute format('select count(*) from %I', tbl) into old_count;
    if old_count != 1 then raise exception 'Invalid fixture rows on %', tbl; end if;
    blocked := false;
    begin
      execute format('delete from %I', tbl);
    exception when raise_exception then
      if SQLERRM like 'FFOS registry is append-only:%' then
        blocked := true;
      else raise;
      end if;
    end;
    if not blocked then raise exception 'Append-only DELETE protection absent on %', tbl; end if;
  end loop;
  blocked := false;
  begin
    update ffos_data_work_orders set purpose='tampered' where work_order_id='test-wo-001';
  exception when raise_exception then
    if SQLERRM like 'FFOS registry is append-only:%' then
      blocked := true;
    else raise;
    end if;
  end;
  if not blocked then raise exception 'Append-only UPDATE protection absent'; end if;
end $$;

-- Duplicate version identity and references to nonexistent work orders fail.
do $$
declare blocked boolean;
begin
  blocked := false;
  begin
    insert into ffos_data_asset_versions
     (asset_version_id,asset_id,owner_repo,asset_kind,schema_ref,location_ref,
      content_sha256,source_as_of,validity,compatibility,license_ref,qa_receipt_ref,
      source_refs,registered_by)
    select asset_version_id,asset_id,owner_repo,asset_kind,schema_ref,location_ref,
      content_sha256,source_as_of,validity,compatibility,license_ref,qa_receipt_ref,
      source_refs,registered_by from ffos_data_asset_versions limit 1;
  exception when unique_violation then
    blocked := true;
  end;
  if not blocked then raise exception 'Duplicate asset version accepted'; end if;

  blocked := false;
  begin
    insert into ffos_data_reuse_decisions
      (decision_id,work_order_id,decision,candidates,selected_asset_version_ids,
       rationale,evidence_refs,decided_by,decided_at)
    values
      ('test-invalid-ref','nonexistent-wo','BLOCKED','[]','[]',
       'not admissible','[]','test-runner','2026-11-16T00:00:00Z');
  exception when foreign_key_violation then
    blocked := true;
  end;
  if not blocked then raise exception 'Missing work order reference accepted'; end if;
end $$;
