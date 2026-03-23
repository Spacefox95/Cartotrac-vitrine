from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.dashboard.models import DashboardEvent, DashboardNotification, DashboardTask
from src.domains.dashboard.schemas import (
    DashboardCalendarRead,
    DashboardEventCreate,
    DashboardEventListResponse,
    DashboardEventRead,
    DashboardEventUpdate,
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


class DashboardService:
    @staticmethod
    def get_dashboard(
        db: Session,
        *,
        today: date | None = None,
    ) -> DashboardResponse:
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
                .where(DashboardNotification.is_read.is_(False))
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
        events = db.scalars(
            select(DashboardEvent)
            .where(DashboardEvent.starts_at >= day_start)
            .order_by(DashboardEvent.starts_at.asc(), DashboardEvent.id.asc())
            .limit(5)
        ).all()
        notifications = db.scalars(
            select(DashboardNotification)
            .order_by(DashboardNotification.is_read.asc(), DashboardNotification.created_at.desc())
            .limit(5)
        ).all()
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
            events=[DashboardEventRead.model_validate(event) for event in events],
            notifications=[DashboardNotificationRead.model_validate(item) for item in notifications],
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
        events = db.scalars(select(DashboardEvent).order_by(DashboardEvent.starts_at.asc(), DashboardEvent.id.asc())).all()
        return DashboardEventListResponse(
            items=[DashboardEventRead.model_validate(event) for event in events],
            total=len(events),
        )

    @staticmethod
    def create_event(db: Session, payload: DashboardEventCreate) -> DashboardEventRead:
        event = DashboardEvent(**payload.model_dump())
        db.add(event)
        db.commit()
        db.refresh(event)
        return DashboardEventRead.model_validate(event)

    @staticmethod
    def update_event(db: Session, event_id: int, payload: DashboardEventUpdate) -> DashboardEventRead:
        event = db.get(DashboardEvent, event_id)
        if event is None:
            raise ValueError('Event not found')
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(event, field, value)
        db.add(event)
        db.commit()
        db.refresh(event)
        return DashboardEventRead.model_validate(event)

    @staticmethod
    def delete_event(db: Session, event_id: int) -> None:
        event = db.get(DashboardEvent, event_id)
        if event is None:
            raise ValueError('Event not found')
        db.delete(event)
        db.commit()

    @staticmethod
    def list_notifications(db: Session) -> DashboardNotificationListResponse:
        items = db.scalars(
            select(DashboardNotification).order_by(DashboardNotification.created_at.desc(), DashboardNotification.id.desc())
        ).all()
        return DashboardNotificationListResponse(
            items=[DashboardNotificationRead.model_validate(item) for item in items],
            total=len(items),
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
        return DashboardNotificationRead.model_validate(item)

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
        return DashboardNotificationRead.model_validate(item)

    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> None:
        item = db.get(DashboardNotification, notification_id)
        if item is None:
            raise ValueError('Notification not found')
        db.delete(item)
        db.commit()
