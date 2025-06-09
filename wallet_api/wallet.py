# blockchain/wallet.py
from mnemonic import Mnemonic
from ecdsa import SigningKey, SECP256k1, VerifyingKey
import hashlib

class Wallet:
    @staticmethod
    def create() -> dict:
        mnemo = Mnemonic('english')
        seed = mnemo.generate(strength=128)
        priv = SigningKey.generate(curve=SECP256k1)
        pub = priv.get_verifying_key()
        
        return {
            "mnemonic": seed,
            "private_key": priv.to_string().hex(),
            "public_key": pub.to_string("compressed").hex(),
            "address": Wallet.generate_address(pub)
        }

    @staticmethod
    def import_from_mnemonic(mnemonic: str) -> dict:
        priv = SigningKey.generate(curve=SECP256k1)  # Em produção, derive da seed
        pub = priv.get_verifying_key()
        
        return {
            "private_key": priv.to_string().hex(),
            "public_key": pub.to_string("compressed").hex(),
            "address": Wallet.generate_address(pub)
        }

    @staticmethod
    def generate_address(pub_key: VerifyingKey) -> str:
        return hashlib.sha256(pub_key.to_string()).hexdigest()[:40]