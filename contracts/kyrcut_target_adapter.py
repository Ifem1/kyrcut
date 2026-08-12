# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass


ACTION_NONE = "NONE"
ACTION_PAUSE = "pause"
ACTION_EMERGENCY = "enterEmergencyMode"


@allow_storage
@dataclass
class KyrcutAction:
    circuit_id: u256
    observation_id: u256
    incident_id: u256
    action: str
    reason_hash: str
    caller: Address


class KyrcutTargetAdapter(gl.Contract):
    trusted_kyrcut: Address
    paused: bool
    emergency_mode: bool
    action_count: u256
    last_action: KyrcutAction

    def __init__(self, trusted_kyrcut: Address) -> None:
        if isinstance(trusted_kyrcut, Address):
            self.trusted_kyrcut = trusted_kyrcut
        else:
            self.trusted_kyrcut = Address(trusted_kyrcut)
        self.paused = False
        self.emergency_mode = False
        self.action_count = u256(0)
        self.last_action = KyrcutAction(
            circuit_id=u256(0),
            observation_id=u256(0),
            incident_id=u256(0),
            action=ACTION_NONE,
            reason_hash="",
            caller=Address("0x0000000000000000000000000000000000000000"),
        )

    def _require_kyrcut(self) -> None:
        sender = gl.message.sender_address
        if not isinstance(sender, Address):
            sender = Address(sender)
        if sender != self.trusted_kyrcut:
            raise gl.vm.UserError("only trusted kyrcut")

    def _record(self, circuit_id: u256, observation_id: u256, incident_id: u256, action: str, reason_hash: str) -> None:
        if circuit_id <= u256(0) or observation_id <= u256(0) or incident_id <= u256(0):
            raise gl.vm.UserError("invalid kyrcut reference")
        if reason_hash == "":
            raise gl.vm.UserError("reason_hash required")
        self.action_count = self.action_count + u256(1)
        self.last_action = KyrcutAction(
            circuit_id=circuit_id,
            observation_id=observation_id,
            incident_id=incident_id,
            action=action,
            reason_hash=reason_hash,
            caller=self.trusted_kyrcut,
        )

    @gl.public.write
    def pause(self, circuit_id: int, observation_id: int, incident_id: int, reason_hash: str) -> None:
        self._require_kyrcut()
        self.paused = True
        self._record(u256(circuit_id), u256(observation_id), u256(incident_id), ACTION_PAUSE, reason_hash)

    @gl.public.write
    def enterEmergencyMode(self, circuit_id: int, observation_id: int, incident_id: int, reason_hash: str) -> None:
        self._require_kyrcut()
        self.paused = True
        self.emergency_mode = True
        self._record(u256(circuit_id), u256(observation_id), u256(incident_id), ACTION_EMERGENCY, reason_hash)

    @gl.public.write
    def clear_for_demo(self) -> None:
        self._require_kyrcut()
        self.paused = False
        self.emergency_mode = False

    @gl.public.view
    def is_paused(self) -> bool:
        return self.paused

    @gl.public.view
    def get_last_kyrcut_action(self) -> dict:
        return {
            "trusted_kyrcut": str(self.trusted_kyrcut),
            "paused": self.paused,
            "emergency_mode": self.emergency_mode,
            "action_count": int(self.action_count),
            "circuit_id": int(self.last_action.circuit_id),
            "observation_id": int(self.last_action.observation_id),
            "incident_id": int(self.last_action.incident_id),
            "action": self.last_action.action,
            "reason_hash": self.last_action.reason_hash,
            "caller": str(self.last_action.caller),
        }
