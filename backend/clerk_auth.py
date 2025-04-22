# clerk_auth.py
import requests
from jose import jwt
from jose.exceptions import JWTError

CLERK_ISSUER = "https://api.clerk.dev"
CLERK_JWKS_URL = "https://api.clerk.dev/.well-known/jwks.json"

jwks_cache = None

def fetch_jwks():
    global jwks_cache
    if not jwks_cache:
        response = requests.get(CLERK_JWKS_URL)
        response.raise_for_status()
        jwks_cache = response.json()
    return jwks_cache

def verify_clerk_token(token: str):
    try:
        jwks = fetch_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]

        key = next(
            (k for k in jwks["keys"] if k["kid"] == kid),
            None
        )

        if not key:
            raise ValueError("Public key not found for JWT")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=None,  # Only set this if you're enforcing custom audiences
            issuer=CLERK_ISSUER,
        )

        return payload

    except JWTError as e:
        raise ValueError("Invalid Clerk token") from e
