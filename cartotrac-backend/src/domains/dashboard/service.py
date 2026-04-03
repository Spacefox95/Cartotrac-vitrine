from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, aliased

from src.domains.clients.models import Client
from src.domains.dashboard.models import DashboardEvent, DashboardNotification, DashboardTask
from src.domains.dashboard.schemas import (
    DashboardCalendarRead,
    DashboardContactListResponse,
    DashboardContactRead,
    DashboardEventCreate,
    DashboardEventListResponse,
    DashboardEventRead,
    DashboardEventUpdate,
    DashboardMessageCreate,
    DashboardNotificationCreate,
    DashboardNotificationListResponse,
    DashboardNotificationRead,
    DashboardNotificationUpdate,
    DashboardRecentQuoteRead,
    DashboardResponse,
    DashboardSummaryRead,
    DashboardTaskCreate,
    DashboardTaskListResponse,
    DashboardTaskRead,
    DashboardTaskUpdate,
)
from src.domains.quotes.models import Quote
from src.domains.users.models import User
from src.domains.users.service import UsersService


class DashboardService:
    @staticmethod
    def _serialize_event(
        event: DashboardEvent,
        *,
        assigned_user_name: str | None = None,
    ) -> DashboardEventRead:
        return DashboardEventRead(
            id=event.id,
            title=event.title,
            description=event.description,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            category=event.category,
            assigned_user_id=event.assigned_user_id,
            assigned_user_name=assigned_user_name,
            location=event.location,
            meeting_url=event.meeting_url,
        )

    @staticmethod
    def _serialize_notification(
        item: DashboardNotification,
        *,
        sender_name: str | None = None,
        sender_email: str | None = None,
        recipient_name: str | None = None,
        recipient_email: str | None = None,
    ) -> DashboardNotificationRead:
        return DashboardNotificationRead(
            id=item.id,
            sender=item.sender,
            sender_user_id=item.sender_user_id,
            sender_email=sender_email,
            recipient_user_id=item.recipient_user_id,
            recipient=recipient_name or recipient_email,
            recipient_email=recipient_email,
            title=item.title,
            message=item.message,
            category=item.category,
            is_read=item.is_read,
            created_at=item.created_at,
        )

    @staticmethod
    def _notification_rows_for_user(db: Session, user_id: int):
        sender_user = aliased(User)
        recipient_user = aliased(User)

        return db.execute(
            select(
                DashboardNotification,
                sender_user.full_name,
                sender_user.email,
                recipient_user.full_name,
                recipient_user.email,
            )
            .outerjoin(sender_user, DashboardNotification.sender_user_id == sender_user.id)
            .outerjoin(recipient_user, DashboardNotification.recipient_user_id == recipient_user.id)
            .where(
                or_(
                    DashboardNotification.recipient_user_id == user_id,
                    DashboardNotification.sender_user_id == user_id,
                    DashboardNotification.recipient_user_id.is_(None),
                )
            )
            .order_by(DashboardNotification.is_read.asc(), DashboardNotification.created_at.desc())
        ).all()

    @staticmethod
    def get_dashboard(
        db: Session,
        *,
        current_user_email: str,
        today: date | None = None,
    ) -> DashboardResponse:
        current_user = UsersService.get_by_email(db, current_user_email)
        if current_user is None:
            raise ValueError('User not found')

        current_day = today or date.today()
        day_start = datetime.combine(current_day, time.min)
        next_day_start = day_start + timedelta(days=1)
        month_start = current_day.replace(day=1)
        if current_day.month == 12:
            next_month_start = date(current_day.year + 1, 1, 1)
        else:
            next_month_start = date(current_day.year, current_day.month + 1, 1)
        month_start_at = datetime.combine(month_start, time.min)
        next_month_start_at = datetime.combine(next_month_start, time.min)

        clients_total = db.scalar(select(func.count()).select_from(Client)) or 0
        quotes_total = db.scalar(select(func.count()).select_from(Quote)) or 0
        draft_quotes_total = (
            db.scalar(select(func.count()).select_from(Quote).where(Quote.status == 'draft')) or 0
        )
        sent_quotes_total = (
            db.scalar(select(func.count()).select_from(Quote).where(Quote.status == 'sent')) or 0
        )
        pipeline_total_ttc = float(
            db.scalar(select(func.coalesce(func.sum(Quote.total_ttc), 0)).select_from(Quote)) or 0
        )
        open_tasks_total = (
            db.scalar(
                select(func.count()).select_from(DashboardTask).where(DashboardTask.status != 'done')
            )
            or 0
        )
        unread_notifications_total = (
            db.scalar(
                select(func.count())
                .select_from(DashboardNotification)
                .where(
                    DashboardNotification.is_read.is_(False),
                    or_(
                        DashboardNotification.recipient_user_id == current_user.id,
                        DashboardNotification.recipient_user_id.is_(None),
                    ),
                )
            )
            or 0
        )
        today_events_total = (
            db.scalar(
                select(func.count())
                .select_from(DashboardEvent)
                .where(DashboardEvent.starts_at >= day_start, DashboardEvent.starts_at < next_day_start)
            )
            or 0
        )

        tasks = db.scalars(
            select(DashboardTask)
            .where(DashboardTask.status != 'done')
            .order_by(DashboardTask.due_at.asc(), DashboardTask.id.asc())
            .limit(5)
        ).all()
        events_rows = db.execute(
            select(DashboardEvent, User.full_name, User.email)
            .outerjoin(User, DashboardEvent.assigned_user_id == User.id)
            .where(DashboardEvent.starts_at >= day_start)
            .order_by(DashboardEvent.starts_at.asc(), DashboardEvent.id.asc())
            .limit(5)
        ).all()
        notifications_rows = DashboardService._notification_rows_for_user(db, current_user.id)[:5]
        recent_quotes_rows = db.execute(
            select(
                Quote.id,
                Quote.reference,
                Quote.status,
                Quote.total_ttc,
                Client.company_name,
            )
            .join(Client, Quote.client_id == Client.id)
            .order_by(Quote.id.desc())
            .limit(5)
        ).all()
        highlighted_days = db.scalars(
            select(func.extract('day', DashboardEvent.starts_at))
            .where(DashboardEvent.starts_at >= month_start_at, DashboardEvent.starts_at < next_month_start_at)
            .order_by(DashboardEvent.starts_at.asc())
        ).all()

        return DashboardResponse(
            summary=DashboardSummaryRead(
                clients_total=clients_total,
                quotes_total=quotes_total,
                draft_quotes_total=draft_quotes_total,
                sent_quotes_total=sent_quotes_total,
                pipeline_total_ttc=pipeline_total_ttc,
                open_tasks_total=open_tasks_total,
                unread_notifications_total=unread_notifications_total,
                today_events_total=today_events_total,
            ),
            calendar=DashboardCalendarRead(
                year=current_day.year,
                month=current_day.month,
                today=current_day.day,
                highlighted_days=sorted({int(day) for day in highlighted_days}),
            ),
            tasks=[DashboardTaskRead.model_validate(task) for task in tasks],
            events=[
                DashboardService._serialize_event(
                    event,
                    assigned_user_name=full_name or email,
                )
                for event, full_name, email in events_rows
            ],
            notifications=[
                DashboardService._serialize_notification(
                    item,
                    sender_name=sender_name,
                    sender_email=sender_email,
                    recipient_name=recipient_name,
                    recipient_email=recipient_email,
                )
                for item, sender_name, sender_email, recipient_name, recipient_email in notifications_rows
            ],
            recent_quotes=[
                DashboardRecentQuoteRead(
                    id=row[0],
                    reference=row[1],
                    status=row[2],
                    total_ttc=float(row[3]),
                    client_name=row[4],
                )
                for row in recent_quotes_rows
            ],
        )

    @staticmethod
    def list_tasks(db: Session) -> DashboardTaskListResponse:
        tasks = db.scalars(select(DashboardTask).order_by(DashboardTask.due_at.asc(), DashboardTask.id.asc())).all()
        return DashboardTaskListResponse(
            items=[DashboardTaskRead.model_validate(task) for task in tasks],
            total=len(tasks),
        )

    @staticmethod
    def create_task(db: Session, payload: DashboardTaskCreate) -> DashboardTaskRead:
        task = DashboardTask(**payload.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return DashboardTaskRead.model_validate(task)

    @staticmethod
    def update_task(db: Session, task_id: int, payload: DashboardTaskUpdate) -> DashboardTaskRead:
        task = db.get(DashboardTask, task_id)
        if task is None:
            raise ValueError('Task not found')
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(task, field, value)
        db.add(task)
        db.commit()
        db.refresh(task)
        return DashboardTaskRead.model_validate(task)

    @staticmethod
    def delete_task(db: Session, task_id: int) -> None:
        task = db.get(DashboardTask, task_id)
        if task is None:
            raise ValueError('Task not found')
        db.delete(task)
        db.commit()

    @staticmethod
    def list_events(db: Session) -> DashboardEventListResponse:
        events_rows = db.execute(
            select(DashboardEvent, User.full_name, User.email)
            .outerjoin(User, DashboardEvent.assigned_user_id == User.id)
            .order_by(DashboardEvent.starts_at.asc(), DashboardEvent.id.asc())
        ).all()
        return DashboardEventListResponse(
            items=[
                DashboardService._serialize_event(
                    event,
                    assigned_user_name=full_name or email,
                )
                for event, full_name, email in events_rows
            ],
            total=len(events_rows),
        )

    @staticmethod
    def create_event(db: Session, payload: DashboardEventCreate) -> DashboardEventRead:
        if payload.assigned_user_id is not None and db.get(User, payload.assigned_user_id) is None:
            raise ValueError('Assigned user not found')

        event = DashboardEvent(**payload.model_dump())
        db.add(event)
        db.commit()
        db.refresh(event)
        assigned_user_name = None
        if event.assigned_user_id is not None:
            user = db.get(User, event.assigned_user_id)
            assigned_user_name = None if user is None else user.full_name or user.email
        return DashboardService._serialize_event(event, assigned_user_name=assigned_user_name)

    @staticmethod
    def update_event(db: Session, event_id: int, payload: DashboardEventUpdate) -> DashboardEventRead:
        event = db.get(DashboardEvent, event_id)
        if event is None:
            raise ValueError('Event not found')
        updates = payload.model_dump(exclude_unset=True)
        assigned_user_id = updates.get('assigned_user_id')
        if assigned_user_id is not None and db.get(User, assigned_user_id) is None:
            raise ValueError('Assigned user not found')
        for field, value in updates.items():
            setattr(event, field, value)
        db.add(event)
        db.commit()
        db.refresh(event)
        assigned_user_name = None
        if event.assigned_user_id is not None:
            user = db.get(User, event.assigned_user_id)
            assigned_user_name = None if user is None else user.full_name or user.email
        return DashboardService._serialize_event(event, assigned_user_name=assigned_user_name)

    @staticmethod
    def delete_event(db: Session, event_id: int) -> None:
        event = db.get(DashboardEvent, event_id)
        if event is None:
            raise ValueError('Event not found')
        db.delete(event)
        db.commit()

    @staticmethod
    def list_notifications(db: Session) -> DashboardNotificationListResponse:
        sender_user = aliased(User)
        recipient_user = aliased(User)
        rows = db.execute(
            select(
                DashboardNotification,
                sender_user.full_name,
                sender_user.email,
                recipient_user.full_name,
                recipient_user.email,
            )
            .outerjoin(sender_user, DashboardNotification.sender_user_id == sender_user.id)
            .outerjoin(recipient_user, DashboardNotification.recipient_user_id == recipient_user.id)
            .order_by(DashboardNotification.created_at.desc(), DashboardNotification.id.desc())
        ).all()
        return DashboardNotificationListResponse(
            items=[
                DashboardService._serialize_notification(
                    item,
                    sender_name=sender_name,
                    sender_email=sender_email,
                    recipient_name=recipient_name,
                    recipient_email=recipient_email,
                )
                for item, sender_name, sender_email, recipient_name, recipient_email in rows
            ],
            total=len(rows),
        )

    @staticmethod
    def create_notification(db: Session, payload: DashboardNotificationCreate) -> DashboardNotificationRead:
        values = payload.model_dump(exclude_none=True)
        if 'created_at' not in values:
            values['created_at'] = datetime.now(UTC).replace(tzinfo=None)
        item = DashboardNotification(**values)
        db.add(item)
        db.commit()
        db.refresh(item)
        sender_email = None
        recipient_email = None
        recipient_name = None
        if item.sender_user_id is not None:
            sender_user = db.get(User, item.sender_user_id)
            sender_email = None if sender_user is None else sender_user.email
        if item.recipient_user_id is not None:
            recipient_user = db.get(User, item.recipient_user_id)
            if recipient_user is not None:
                recipient_email = recipient_user.email
                recipient_name = recipient_user.full_name
        return DashboardService._serialize_notification(
            item,
            sender_email=sender_email,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
        )

    @staticmethod
    def update_notification(
        db: Session,
        notification_id: int,
        payload: DashboardNotificationUpdate,
    ) -> DashboardNotificationRead:
        item = db.get(DashboardNotification, notification_id)
        if item is None:
            raise ValueError('Notification not found')
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        db.add(item)
        db.commit()
        db.refresh(item)
        sender_email = None
        recipient_email = None
        recipient_name = None
        if item.sender_user_id is not None:
            sender_user = db.get(User, item.sender_user_id)
            sender_email = None if sender_user is None else sender_user.email
        if item.recipient_user_id is not None:
            recipient_user = db.get(User, item.recipient_user_id)
            if recipient_user is not None:
                recipient_email = recipient_user.email
                recipient_name = recipient_user.full_name
        return DashboardService._serialize_notification(
            item,
            sender_email=sender_email,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
        )

    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> None:
        item = db.get(DashboardNotification, notification_id)
        if item is None:
            raise ValueError('Notification not found')
        db.delete(item)
        db.commit()

    @staticmethod
    def list_message_contacts(
        db: Session,
        *,
        current_user_email: str,
    ) -> DashboardContactListResponse:
        current_user = UsersService.get_by_email(db, current_user_email)
        if current_user is None:
            raise ValueError('User not found')

        users = db.scalars(select(User).where(User.id != current_user.id).order_by(User.email.asc())).all()
        return DashboardContactListResponse(
            items=[
                DashboardContactRead(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                )
                for user in users
            ],
            total=len(users),
        )

    @staticmethod
    def list_messages(
        db: Session,
        *,
        current_user_email: str,
    ) -> DashboardNotificationListResponse:
        current_user = UsersService.get_by_email(db, current_user_email)
        if current_user is None:
            raise ValueError('User not found')

        rows = DashboardService._notification_rows_for_user(db, current_user.id)
        filtered_rows = [row for row in rows if row[0].category == 'message']
        return DashboardNotificationListResponse(
            items=[
                DashboardService._serialize_notification(
                    item,
                    sender_name=sender_name,
                    sender_email=sender_email,
                    recipient_name=recipient_name,
                    recipient_email=recipient_email,
                )
                for item, sender_name, sender_email, recipient_name, recipient_email in filtered_rows
            ],
            total=len(filtered_rows),
        )

    @staticmethod
    def send_message(
        db: Session,
        *,
        sender_email: str,
        payload: DashboardMessageCreate,
    ) -> DashboardNotificationRead:
        sender_user = UsersService.get_by_email(db, sender_email)
        if sender_user is None:
            raise ValueError('Sender not found')

        recipient_user = db.get(User, payload.recipient_user_id)
        if recipient_user is None:
            raise ValueError('Recipient not found')

        message = DashboardNotification(
            sender=sender_user.full_name or sender_user.email,
            sender_user_id=sender_user.id,
            recipient_user_id=recipient_user.id,
            title=payload.title.strip(),
            message=payload.message,
            category='message',
            is_read=False,
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return DashboardService._serialize_notification(
            message,
            sender_name=sender_user.full_name,
            sender_email=sender_user.email,
            recipient_name=recipient_user.full_name,
            recipient_email=recipient_user.email,
        )

    @staticmethod
    def mark_message_read(
        db: Session,
        *,
        message_id: int,
        current_user_email: str,
    ) -> DashboardNotificationRead:
        current_user = UsersService.get_by_email(db, current_user_email)
        if current_user is None:
            raise ValueError('User not found')

        item = db.get(DashboardNotification, message_id)
        if item is None or item.category != 'message':
            raise ValueError('Message not found')
        if item.recipient_user_id not in {None, current_user.id}:
            raise ValueError('Message not accessible')

        item.is_read = True
        db.add(item)
        db.commit()
        db.refresh(item)

        sender_user = None if item.sender_user_id is None else db.get(User, item.sender_user_id)
        recipient_user = None if item.recipient_user_id is None else db.get(User, item.recipient_user_id)
        return DashboardService._serialize_notification(
            item,
            sender_name=None if sender_user is None else sender_user.full_name,
            sender_email=None if sender_user is None else sender_user.email,
            recipient_name=None if recipient_user is None else recipient_user.full_name,
            recipient_email=None if recipient_user is None else recipient_user.email,
        )
