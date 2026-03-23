from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.permissions import get_permissions_for_role, is_admin_role, normalize_role
from src.core.security import get_password_hash
from src.domains.users.models import User
from src.domains.users.repository import UsersRepository
from src.domains.users.schemas import UserCreate, UserListResponse, UserRead, UserUpdate


class UsersService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return UsersRepository.get_by_email(db, email)

    @staticmethod
    def serialize_user(user: User) -> UserRead:
        role = normalize_role(user.role)
        return UserRead(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=role,
            permissions=get_permissions_for_role(role),
            is_admin=is_admin_role(role),
        )

    @staticmethod
    def get_user(db: Session, user_id: int) -> UserRead:
        user = UsersRepository.get_by_id(db, user_id)

        if user is None:
            raise ValueError('User not found')

        return UsersService.serialize_user(user)

    @staticmethod
    def list_users(db: Session) -> UserListResponse:
        users, total = UsersRepository.list_users(db)
        return UserListResponse(
            items=[UsersService.serialize_user(user) for user in users],
            total=total,
        )

    @staticmethod
    def create_user(db: Session, payload: UserCreate) -> UserRead:
        role = normalize_role(payload.role)
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
            role=role,
            is_admin=is_admin_role(role),
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('User email already exists') from exc

        return UsersService.serialize_user(user)

    @staticmethod
    def update_user(db: Session, user_id: int, payload: UserUpdate) -> UserRead:
        user = UsersRepository.get_by_id(db, user_id)

        if user is None:
            raise ValueError('User not found')

        updates = payload.model_dump(exclude_unset=True)

        if 'password' in updates:
            password = updates.pop('password')
            if password:
                user.hashed_password = get_password_hash(password)

        if 'role' in updates and updates['role'] is not None:
            role = normalize_role(updates.pop('role'))
            user.role = role
            user.is_admin = is_admin_role(role)

        for field, value in updates.items():
            setattr(user, field, value)

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('User email already exists') from exc

        return UsersService.serialize_user(user)

    @staticmethod
    def delete_user(db: Session, user_id: int, current_user_email: str) -> None:
        user = UsersRepository.get_by_id(db, user_id)

        if user is None:
            raise ValueError('User not found')

        if user.email == current_user_email:
            raise ValueError('Cannot delete current user')

        db.delete(user)
        db.commit()
