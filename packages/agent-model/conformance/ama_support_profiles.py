"""AMA M2/M6 supporting contracts for secret references and localization.

No secret bytes, credential provider, translation engine or locale environment
is read or configured by these static validators.
"""
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import registry, digest, validate_bundle


def _out(errors, kind, count):
    return {
        "schema":"ama."+kind+"-assessment/v1",
        "status":"REJECTED" if errors else "STATIC_"+kind.upper()+"_ELIGIBLE",
        "errors":sorted(set(errors)), "records_checked":count,
        "host_enforced":False, "runtime_authorized":False,
        "agent_activated":False,
    }


def _scope_inside(child, parent):
    return child==parent or child.startswith(parent.rstrip("/")+"/")


def _base(bundle, collection, schema_name):
    problems=validate_bundle(bundle)
    if problems:
        return ["INVALID_M1_BUNDLE"]+problems
    reg,schemas=registry()
    v=Draft202012Validator(schemas[schema_name],registry=reg,
                           format_checker=FormatChecker())
    return ["SCHEMA:"+collection for r in bundle.get(collection,[])
            if list(v.iter_errors(r))]


def check_secret_bindings(bundle):
    collection="secretBindings"
    rows=bundle.get(collection,[])
    errors=_base(bundle,collection,"secret-binding")
    if errors:
        return _out(errors,"secrets",len(rows))
    agent=bundle["agent"]
    caps={r["capabilityId"]:r for r in bundle["capabilities"]}
    adapters={r["adapterId"]:r for r in bundle["toolAdapters"]}
    ids=[r["bindingId"] for r in rows]
    if len(ids)!=len(set(ids)):
        errors.append("DUPLICATE_SECRET_BINDING")
    for row in rows:
        ref=row["agentRef"]
        if (ref["id"]!=agent["agentId"] or ref["version"]!=agent["agentVersion"]
                or ref["digest"]!=digest(agent)):
            errors.append("SECRET_AGENT_PIN_MISMATCH")
        cr=row["capabilityRef"]
        cap=caps.get(cr["id"])
        if not cap or cap["version"]!=cr["version"] or digest(cap)!=cr["digest"]:
            errors.append("SECRET_CAPABILITY_PIN_MISMATCH")
            continue
        if not any(_scope_inside(row["resourceScope"],scope)
                   for scope in agent["mandate"]["scope"]):
            errors.append("SECRET_SCOPE_EXCEEDS_MANDATE")
        if not any(_scope_inside(row["resourceScope"],scope)
                   for scope in cap["resourceScopes"]):
            errors.append("SECRET_SCOPE_EXCEEDS_CAPABILITY")
        adapter=adapters.get(cap["adapterRef"]["id"])
        if not adapter or adapter["credentialBindingRequired"] is not True:
            errors.append("UNNECESSARY_OR_UNSUPPORTED_SECRET_BINDING")
        if row["status"]=="ACTIVE":
            errors.append("SECRET_ACTIVE_CANNOT_BE_SELF_ATTESTED")
    result=_out(errors,"secrets",len(rows))
    result["credentials_present"]=False
    result["provider_authenticated"]=False
    result["rotation_verified"]=False
    result["revocation_verified"]=False
    return result


def check_localization_profiles(bundle):
    collection="localizationProfiles"
    rows=bundle.get(collection,[])
    errors=_base(bundle,collection,"localization-profile")
    if errors:
        return _out(errors,"localization",len(rows))
    agent=bundle["agent"]
    ids=[r["profileId"] for r in rows]
    if len(ids)!=len(set(ids)):
        errors.append("DUPLICATE_LOCALIZATION_PROFILE")
    for row in rows:
        ref=row["agentRef"]
        if (ref["id"]!=agent["agentId"] or ref["version"]!=agent["agentVersion"]
                or ref["digest"]!=digest(agent)):
            errors.append("LOCALIZATION_AGENT_PIN_MISMATCH")
        supported=[x.lower() for x in row["supportedLocales"]]
        fallback=[x.lower() for x in row["fallbackLocales"]]
        default=row["defaultLocale"].lower()
        if len(set(supported))!=len(supported):
            errors.append("DUPLICATE_LOCALE_CANONICAL_CASE")
        if default not in supported:
            errors.append("DEFAULT_LOCALE_UNSUPPORTED")
        if len(set(fallback))!=len(fallback):
            errors.append("DUPLICATE_FALLBACK_LOCALE")
        if any(x not in supported or x==default for x in fallback):
            errors.append("INVALID_FALLBACK_LOCALE")
        if row["status"]=="ACTIVE":
            errors.append("LOCALIZATION_ACTIVE_REQUIRES_HOST_ACCEPTANCE")
    result=_out(errors,"localization",len(rows))
    result["translations_verified"]=False
    result["accessibility_verified"]=False
    result["host_timezone_resolved"]=False
    return result
