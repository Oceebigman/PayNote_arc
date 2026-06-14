"""
PayNote Python SDK
Payment coordination infrastructure on Arc Network
pip install requests
"""

import requests
import time
import hmac
import hashlib
import json
from typing import Optional, Dict, Any

BASE_URL = "https://paynote.space"


class PayNoteError(Exception):
    def __init__(self, message: str, code: str = None, status: int = None):
        super().__init__(message)
        self.code = code
        self.status = status


class PayNote:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "paynote-python-sdk/1.0.0",
        })

    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        url = self.base_url + path
        try:
            res = self.session.request(method, url, timeout=30, **kwargs)
        except requests.Timeout:
            raise PayNoteError("Request timed out. Arc RPC may be slow — retry in 30s.", code="TIMEOUT")
        except requests.ConnectionError:
            raise PayNoteError("Connection failed.", code="CONNECTION_ERROR")

        try:
            data = res.json()
        except Exception:
            raise PayNoteError(f"Invalid response: {res.text}", code="PARSE_ERROR", status=res.status_code)

        if not res.ok:
            raise PayNoteError(
                data.get("error", "Unknown error"),
                code=data.get("code"),
                status=res.status_code,
            )
        return data

    def get_api_key(self, email: str, use_case: str, project_name: str = None) -> Dict[str, Any]:
        """Self-serve API key generation. No auth required."""
        return self._request("POST", "/api/keys/request", json={
            "email": email,
            "use_case": use_case,
            "project_name": project_name,
        })

    def create_request(
        self,
        api_key: str,
        amount: float,
        reason: str,
        to_address: str,
        token: str = "USDC",
        note: str = None,
        expires_in: int = None,
        recurring: str = "once",
        display_name: str = None,
    ) -> Dict[str, Any]:
        """Create a payment request. Returns slug and shareable URL."""
        self.session.headers["Authorization"] = f"Bearer {api_key}"
        return self._request("POST", "/api/request", json={
            "amount": amount,
            "reason": reason,
            "to_address": to_address,
            "token": token,
            "note": note,
            "expires_in": expires_in,
            "recurring": recurring,
            "display_name": display_name,
        })

    def create_agent_request(self, api_key: str, amount: float, reason: str, to_address: str, token: str = "USDC", **kwargs) -> Dict[str, Any]:
        """Agent-optimised endpoint. Returns full instruction set + ERC-8183 headers."""
        self.session.headers["Authorization"] = f"Bearer {api_key}"
        return self._request("POST", "/api/agent/pay", json={
            "amount": amount, "reason": reason,
            "to_address": to_address, "token": token, **kwargs
        })

    def get_status(self, slug: str) -> Dict[str, Any]:
        """Check payment status. No auth required."""
        return self._request("GET", f"/api/poll?slug={slug}")

    def wait_for_payment(
        self,
        slug: str,
        timeout_seconds: int = 300,
        interval_seconds: int = 3,
    ) -> Dict[str, Any]:
        """Poll until payment completes or times out."""
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            status = self.get_status(slug)
            if status["status"] == "completed":
                return status
            if status["status"] == "failed":
                raise PayNoteError("Payment failed on chain", code="PAYMENT_FAILED")
            if status["status"] == "expired":
                raise PayNoteError("Payment request expired", code="EXPIRED")
            time.sleep(interval_seconds)
        raise PayNoteError(f"Payment timed out after {timeout_seconds}s", code="TIMEOUT")

    def register_webhook(self, url: str, secret: str, events: list = None) -> Dict[str, Any]:
        """Register a webhook endpoint."""
        return self._request("POST", "/api/webhooks", json={
            "url": url,
            "secret": secret,
            "events": events or ["payment.completed", "payment.created"],
        })

    @staticmethod
    def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
        """Verify a webhook payload signature."""
        expected = "sha256=" + hmac.new(
            secret.encode(), payload.encode(), hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)


# Example usage
if __name__ == "__main__":
    sdk = PayNote()

    # Get API key (one time)
    # key_data = sdk.get_api_key("you@email.com", "Agent payment testing", "My Project")
    # api_key = key_data["key"]
    # print(f"Your key: {api_key}")

    api_key = "pn_your_key_here"

    # Create a payment request
    request = sdk.create_request(
        api_key=api_key,
        amount=5.0,
        reason="Python SDK test",
        to_address="0xYourWalletAddress",
        token="USDC",
    )
    print(f"Payment URL: {request['url']}")

    # Wait for payment
    try:
        result = sdk.wait_for_payment(request["slug"], timeout_seconds=120)
        print(f"Paid! TX: {result['tx_hash']}")
    except PayNoteError as e:
        print(f"Error: {e} (code: {e.code})")
