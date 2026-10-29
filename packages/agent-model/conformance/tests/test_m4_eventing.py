"""M4 optional eventing: no event source is trusted or dispatched by this suite."""
import copy
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
from ama_eventing import check_event_triggers
from test_m1_contracts import fixture,pin


def event_fixture(kind="WEBHOOK"):
    b=fixture()
    mkind="SCHEDULING" if kind=="SCHEDULE" else "EVENTS"
    module="SYNTHETIC."+mkind
    b["agent"]["modules"].append(
        {"moduleId":module,"version":"0.2.0","enabled":True,"kind":mkind})
    trigger={
        "schema":"ama.event-trigger/v0.2-candidate",
        "triggerId":"SYNTHETIC.TRIGGER","version":"0.2.0","status":"VALIDATED",
        "moduleId":module,"triggerKind":kind,
        "commandRef":pin(b["commands"][0],"commandId"),
        "workflowRef":pin(b["workflows"][0],"workflowId"),
        "maxEffectClass":"E0_OBSERVE",
        "authorizationRequired":True,
        "untrustedPayloadCannotOverrideMandate":True,
        "maxEventAgeSeconds":180,
        "maxDeliveries":3,
        "maxConcurrentRuns":1,
        "replayPolicy":"NO_IMPLICIT_REPLAY",
        "failureMode":"HOLD_FOR_REVIEW"
    }
    if kind=="SCHEDULE":
        trigger["schedule"]={"expression":"0 12 * * *",
                             "timeZone":"Etc/UTC","occurrenceKeyRequired":True}
    else:
        trigger["externalSource"]={
            "sourceRef":"external-source-placeholder",
            "authenticationRequired":True,
            "idempotencyKeyField":"eventId",
            "payloadSchema":{"type":"object","properties":{"eventId":{"type":"string"}},
                             "required":["eventId"]}
        }
    b["eventTriggers"]=[trigger]
    return b


class EventTriggerTests(unittest.TestCase):
    def bad(self,b,code):
        r=check_event_triggers(b)
        self.assertEqual(r["status"],"REJECTED",r)
        self.assertIn(code,r["errors"],r)
        self.assertFalse(r["effect_authorized"])

    def test_disabled_optional_eventing_not_required(self):
        self.assertEqual(check_event_triggers(fixture())["status"],
                         "STATIC_EVENTING_ELIGIBLE")

    def test_webhook_bounded_reference_contract(self):
        r=check_event_triggers(event_fixture())
        self.assertEqual(r["status"],"STATIC_EVENTING_ELIGIBLE",r)
        self.assertFalse(r["events_dispatched"])
        self.assertFalse(r["host_dispatch_authenticated"])

    def test_queue_uses_same_generic_contract(self):
        self.assertEqual(check_event_triggers(event_fixture("QUEUE"))["errors"],[])

    def test_schedule_uses_separate_explicit_module(self):
        r=check_event_triggers(event_fixture("SCHEDULE"))
        self.assertEqual(r["status"],"STATIC_EVENTING_ELIGIBLE",r)
        self.assertFalse(r["schedule_expression_verified"])

    def test_module_disabled(self):
        b=event_fixture()
        b["agent"]["modules"][-1]["enabled"]=False
        self.bad(b,"TRIGGER_MODULE_NOT_ENABLED")

    def test_mismatched_command_digest(self):
        b=event_fixture()
        b["eventTriggers"][0]["commandRef"]["digest"]="sha256:"+"0"*64
        self.bad(b,"TRIGGER_COMMAND_REF_INVALID")

    def test_trigger_cannot_raise_effect_ceiling(self):
        b=event_fixture()
        b["eventTriggers"][0]["maxEffectClass"]="E3_EXTERNAL_EFFECT"
        self.bad(b,"TRIGGER_EFFECT_ESCALATION")

    def test_active_does_not_self_authorize(self):
        b=event_fixture()
        b["eventTriggers"][0]["status"]="ACTIVE"
        self.bad(b,"TRIGGER_ACTIVE_REQUIRES_HOST_ACCEPTANCE")

    def test_schedule_requires_occurrence_key(self):
        b=event_fixture("SCHEDULE")
        b["eventTriggers"][0]["schedule"]["occurrenceKeyRequired"]=False
        self.bad(b,"BUNDLE_INVALID")

    def test_external_source_needs_idempotency_field(self):
        b=event_fixture()
        del b["eventTriggers"][0]["externalSource"]["idempotencyKeyField"]
        self.bad(b,"BUNDLE_INVALID")

    def test_payload_cannot_override_mandate(self):
        b=event_fixture()
        b["eventTriggers"][0]["untrustedPayloadCannotOverrideMandate"]=False
        self.bad(b,"BUNDLE_INVALID")

    def test_duplicate_triggers_rejected(self):
        b=event_fixture()
        b["eventTriggers"].append(copy.deepcopy(b["eventTriggers"][0]))
        self.bad(b,"DUPLICATE_EVENT_TRIGGER")


if __name__=="__main__":
    unittest.main()
