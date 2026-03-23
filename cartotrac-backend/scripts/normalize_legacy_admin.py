import argparse
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.session import SessionLocal
from src.domains.users.models import User

CANONICAL_ADMIN_EMAIL = 'admin@cartotrac.com'
LEGACY_ADMIN_EMAIL = 'admin.local@cartotrac.com'


@dataclass
class NormalizationPlan:
    action: str
    message: str


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def describe_user(user: User | None, label: str) -> str:
    if user is None:
        return f'{label}: missing'

    return (
        f'{label}: id={user.id}, email={user.email}, full_name={user.full_name!r}, '
        f'role={user.role}, is_admin={user.is_admin}'
    )


def build_plan(canonical_user: User | None, legacy_user: User | None) -> NormalizationPlan:
    if canonical_user is None and legacy_user is None:
        return NormalizationPlan(
            action='noop',
            message='No canonical or legacy admin account was found.',
        )

    if canonical_user is None and legacy_user is not None:
        return NormalizationPlan(
            action='rename_legacy',
            message=(
                'Canonical admin is missing and legacy admin exists. '
                'The legacy account can be renamed to the canonical email.'
            ),
        )

    if canonical_user is not None and legacy_user is None:
        return NormalizationPlan(
            action='noop',
            message='Canonical admin already exists and no legacy admin account remains.',
        )

    assert canonical_user is not None
    assert legacy_user is not None

    if canonical_user.role != 'admin' or canonical_user.is_admin is not True:
        return NormalizationPlan(
            action='manual_review',
            message=(
                'Canonical admin exists but is not marked as admin. '
                'Refusing automatic cleanup.'
            ),
        )

    if legacy_user.role != 'admin' or legacy_user.is_admin is not True:
        return NormalizationPlan(
            action='manual_review',
            message=(
                'Legacy admin exists but is not marked as admin. '
                'Refusing automatic cleanup.'
            ),
        )

    return NormalizationPlan(
        action='delete_legacy',
        message=(
            'Canonical and legacy admin accounts both exist and are admin users. '
            'The legacy account can be removed safely.'
        ),
    )


def apply_plan(db: Session, plan: NormalizationPlan, canonical_user: User | None, legacy_user: User | None) -> None:
    if plan.action == 'noop':
        return

    if plan.action == 'manual_review':
        raise SystemExit('Manual review required; no changes were applied.')

    if plan.action == 'rename_legacy':
        assert legacy_user is not None
        legacy_user.email = CANONICAL_ADMIN_EMAIL
        legacy_user.role = 'admin'
        legacy_user.is_admin = True
        db.add(legacy_user)
        db.commit()
        db.refresh(legacy_user)
        return

    if plan.action == 'delete_legacy':
        assert legacy_user is not None
        assert canonical_user is not None

        if canonical_user.full_name in {None, ''} and legacy_user.full_name not in {None, ''}:
            canonical_user.full_name = legacy_user.full_name
            db.add(canonical_user)

        db.delete(legacy_user)
        db.commit()
        db.refresh(canonical_user)
        return

    raise SystemExit(f'Unsupported action: {plan.action}')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Normalize the legacy Cartotrac admin account.',
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Apply the normalization plan instead of only printing it.',
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    db = SessionLocal()

    try:
        canonical_user = get_user_by_email(db, CANONICAL_ADMIN_EMAIL)
        legacy_user = get_user_by_email(db, LEGACY_ADMIN_EMAIL)
        plan = build_plan(canonical_user, legacy_user)

        print(describe_user(canonical_user, 'canonical_admin'))
        print(describe_user(legacy_user, 'legacy_admin'))
        print(f'plan: {plan.action}')
        print(plan.message)

        if args.apply is False:
            print('Dry run only. Re-run with --apply to make changes.')
            return 0

        apply_plan(db, plan, canonical_user, legacy_user)
        db.expire_all()

        updated_canonical_user = get_user_by_email(db, CANONICAL_ADMIN_EMAIL)
        updated_legacy_user = get_user_by_email(db, LEGACY_ADMIN_EMAIL)
        print('Applied normalization plan.')
        print(describe_user(updated_canonical_user, 'canonical_admin'))
        print(describe_user(updated_legacy_user, 'legacy_admin'))
        return 0
    finally:
        db.close()


if __name__ == '__main__':
    raise SystemExit(main())
