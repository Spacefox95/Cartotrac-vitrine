from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import get_current_user, require_permission
from src.core.database import get_database
from src.domains.auth.schemas import CurrentUserResponse
from src.domains.dashboard.schemas import (
    DashboardContactListResponse,
    DashboardEventCreate,
    DashboardEventListResponse,
    DashboardEventRead,
    DashboardEventUpdate,
    DashboardMessageCreate,
    DashboardNotificationCreate,
    DashboardNotificationListResponse,
    DashboardNotificationRead,
    DashboardNotificationUpdate,
    DashboardResponse,
    DashboardTaskCreate,
    DashboardTaskListResponse,
    DashboardTaskRead,
    DashboardTaskUpdate,
)
from src.domains.dashboard.service import DashboardService

router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@router.get('', response_model=DashboardResponse)
def get_dashboard(
    current_user: CurrentUserResponse = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> DashboardResponse:
    return DashboardService.get_dashboard(db, current_user_email=current_user.email)


@router.get('/tasks', response_model=DashboardTaskListResponse)
def list_tasks(
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardTaskListResponse:
    return DashboardService.list_tasks(db)


@router.post('/tasks', response_model=DashboardTaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: DashboardTaskCreate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardTaskRead:
    return DashboardService.create_task(db, payload)


@router.patch('/tasks/{task_id}', response_model=DashboardTaskRead)
def update_task(
    task_id: int,
    payload: DashboardTaskUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardTaskRead:
    try:
        return DashboardService.update_task(db, task_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete('/tasks/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        DashboardService.delete_task(db, task_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/events', response_model=DashboardEventListResponse)
def list_events(
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardEventListResponse:
    return DashboardService.list_events(db)


@router.post('/events', response_model=DashboardEventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: DashboardEventCreate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardEventRead:
    try:
        return DashboardService.create_event(db, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail in {'Event not found', 'Assigned user not found'} else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.patch('/events/{event_id}', response_model=DashboardEventRead)
def update_event(
    event_id: int,
    payload: DashboardEventUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardEventRead:
    try:
        return DashboardService.update_event(db, event_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail in {'Event not found', 'Assigned user not found'} else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.delete('/events/{event_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        DashboardService.delete_event(db, event_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/notifications', response_model=DashboardNotificationListResponse)
def list_notifications(
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardNotificationListResponse:
    return DashboardService.list_notifications(db)


@router.post('/notifications', response_model=DashboardNotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: DashboardNotificationCreate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardNotificationRead:
    return DashboardService.create_notification(db, payload)


@router.patch('/notifications/{notification_id}', response_model=DashboardNotificationRead)
def update_notification(
    notification_id: int,
    payload: DashboardNotificationUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> DashboardNotificationRead:
    try:
        return DashboardService.update_notification(db, notification_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete('/notifications/{notification_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        DashboardService.delete_notification(db, notification_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/message-contacts', response_model=DashboardContactListResponse)
def list_message_contacts(
    current_user: CurrentUserResponse = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> DashboardContactListResponse:
    return DashboardService.list_message_contacts(db, current_user_email=current_user.email)


@router.get('/messages', response_model=DashboardNotificationListResponse)
def list_messages(
    current_user: CurrentUserResponse = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> DashboardNotificationListResponse:
    return DashboardService.list_messages(db, current_user_email=current_user.email)


@router.post('/messages', response_model=DashboardNotificationRead, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: DashboardMessageCreate,
    current_user: CurrentUserResponse = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> DashboardNotificationRead:
    try:
        return DashboardService.send_message(db, sender_email=current_user.email, payload=payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_404_NOT_FOUND if detail in {'Sender not found', 'Recipient not found'} else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.patch('/messages/{message_id}/read', response_model=DashboardNotificationRead)
def mark_message_read(
    message_id: int,
    current_user: CurrentUserResponse = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> DashboardNotificationRead:
    try:
        return DashboardService.mark_message_read(
            db,
            message_id=message_id,
            current_user_email=current_user.email,
        )
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_404_NOT_FOUND if detail == 'Message not found' else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=detail) from exc
