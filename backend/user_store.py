from typing import Dict, Optional
from .models import UserCreate, UserUpdate, UserOut
from .auth import get_password_hash

class UserStore:
    def __init__(self):
        self._users: Dict[int, UserOut] = {}
        self._passwords: Dict[int, str] = {}
        self._emails: Dict[str, int] = {}
        self._next_id = 1

    def create_user(self, user: UserCreate) -> UserOut:
        user_out = UserOut(
            id=self._next_id,
            email=user.email,
            full_name=user.full_name,
            role=user.role
        )
        hashed_pw = get_password_hash(user.password)
        self._users[self._next_id] = user_out
        self._passwords[self._next_id] = hashed_pw
        self._emails[user.email] = self._next_id
        self._next_id += 1
        return user_out

    def get_user(self, user_id: int) -> Optional[UserOut]:
        return self._users.get(user_id)

    def get_all_users(self):
        return list(self._users.values())

    def get_user_by_email(self, email: str) -> Optional[UserOut]:
        user_id = self._emails.get(email)
        if user_id:
            return self._users.get(user_id)
        return None

    def get_hashed_password(self, user_id: int) -> Optional[str]:
        return self._passwords.get(user_id)

    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[UserOut]:
        user = self._users.get(user_id)
        if user:
            updated = user.copy(update=user_update.dict(exclude_unset=True))
            self._users[user_id] = updated
            if user_update.password:
                self._passwords[user_id] = get_password_hash(user_update.password)
            return updated
        return None

    def delete_user(self, user_id: int):
        user = self._users.pop(user_id, None)
        if user:
            self._passwords.pop(user_id, None)
            self._emails.pop(user.email, None)

# Singleton instance and helper
user_store = UserStore()

def get_user_by_email(email: str):
    user = user_store.get_user_by_email(email)
    if user:
        user_id = user.id
        hashed_password = user_store.get_hashed_password(user_id)
        user.hashed_password = hashed_password  # attach for authentication
    return user
