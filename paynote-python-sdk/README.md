# paynote-sdk (Python)

Python SDK for PayNote — payment coordination on Arc Network.

## Install

```bash
pip install requests
```

## Usage

```python
from paynote import PayNote, PayNoteError

sdk = PayNote()

# Get API key (one-time, self-serve)
key_data = sdk.get_api_key("you@email.com", "My agent payment tool")
api_key = key_data["key"]

# Create a payment request
request = sdk.create_request(
    api_key=api_key,
    amount=50.0,
    reason="Freelance invoice #003",
    to_address="0xYourWallet",
    token="USDC",
)
print(request["url"])
# https://paynote.space/r/abc12345

# Wait for payment
result = sdk.wait_for_payment(request["slug"])
print(result["tx_hash"])

# Agent endpoint (ERC-8183 headers)
agent_request = sdk.create_agent_request(
    api_key=api_key,
    amount=10.0,
    reason="Task completed",
    to_address="0xAgentWallet",
)
print(agent_request["instructions"]["x402_url"])
```

## Webhook verification

```python
@app.post("/webhooks/paynote")
def handle_webhook(request):
    sig = request.headers["X-PayNote-Signature"]
    valid = PayNote.verify_webhook_signature(
        request.body.decode(),
        sig,
        "your_secret"
    )
    if not valid:
        return 401
    event = request.json["event"]
    # handle event
    return 200
```
