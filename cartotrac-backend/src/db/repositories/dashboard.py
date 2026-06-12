from sqlalchemy.orm import Session

from src.db.models.dashboard import DashboardEvent, DashboardNotification, DashboardTask


class DashboardRepository:
    @staticmethod
    def get_task(db: Session, task_id: int) -> DashboardTask | None:
        return db.get(DashboardTask, task_id)

    @staticmethod
    def add_task(db: Session, task: DashboardTask) -> None:
        db.add(task)

    @staticmethod
    def delete_task(db: Session, task: DashboardTask) -> None:
        db.delete(task)

    @staticmethod
    def get_event(db: Session, event_id: int) -> DashboardEvent | None:
        return db.get(DashboardEvent, event_id)

    @staticmethod
    def add_event(db: Session, event: DashboardEvent) -> None:
        db.add(event)

    @staticmethod
    def delete_event(db: Session, event: DashboardEvent) -> None:
        db.delete(event)

    @staticmethod
    def get_notification(db: Session, notification_id: int) -> DashboardNotification | None:
        return db.get(DashboardNotification, notification_id)

    @staticmethod
    def add_notification(db: Session, notification: DashboardNotification) -> None:
        db.add(notification)

    @staticmethod
    def delete_notification(db: Session, notification: DashboardNotification) -> None:
        db.delete(notification)
