from datetime import datetime

from src.common.schemas.base import BaseSchema


class DashboardSummaryRead(BaseSchema):
    clients_total: int
    quotes_total: int
    draft_quotes_total: int
    sent_quotes_total: int
    pipeline_total_ttc: float
    open_tasks_total: int
    unread_notifications_total: int
    today_events_total: int


class DashboardCalendarRead(BaseSchema):
    year: int
    month: int
    today: int
    highlighted_days: list[int]


class DashboardTaskRead(BaseSchema):
    id: int
    title: str
    description: str | None = None
    due_at: datetime
    status: str
    priority: str
    progress: int


class DashboardTaskCreate(BaseSchema):
    title: str
    description: str | None = None
    due_at: datetime
    status: str = 'todo'
    priority: str = 'medium'
    progress: int = 0


class DashboardTaskUpdate(BaseSchema):
    title: str | None = None
    description: str | None = None
    due_at: datetime | None = None
    status: str | None = None
    priority: str | None = None
    progress: int | None = None


class DashboardTaskListResponse(BaseSchema):
    items: list[DashboardTaskRead]
    total: int


class DashboardEventRead(BaseSchema):
    id: int
    title: str
    description: str | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    category: str
    assigned_user_id: int | None = None
    assigned_user_name: str | None = None
    location: str | None = None
    meeting_url: str | None = None


class DashboardEventCreate(BaseSchema):
    title: str
    description: str | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    category: str = 'meeting'
    assigned_user_id: int | None = None
    location: str | None = None
    meeting_url: str | None = None


class DashboardEventUpdate(BaseSchema):
    title: str | None = None
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    category: str | None = None
    assigned_user_id: int | None = None
    location: str | None = None
    meeting_url: str | None = None


class DashboardEventListResponse(BaseSchema):
    items: list[DashboardEventRead]
    total: int


class DashboardNotificationRead(BaseSchema):
    id: int
    sender: str
    sender_user_id: int | None = None
    sender_email: str | None = None
    recipient_user_id: int | None = None
    recipient: str | None = None
    recipient_email: str | None = None
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime


class DashboardNotificationCreate(BaseSchema):
    sender: str
    sender_user_id: int | None = None
    recipient_user_id: int | None = None
    title: str
    message: str
    category: str = 'general'
    is_read: bool = False
    created_at: datetime | None = None


class DashboardNotificationUpdate(BaseSchema):
    sender: str | None = None
    sender_user_id: int | None = None
    recipient_user_id: int | None = None
    title: str | None = None
    message: str | None = None
    category: str | None = None
    is_read: bool | None = None
    created_at: datetime | None = None


class DashboardNotificationListResponse(BaseSchema):
    items: list[DashboardNotificationRead]
    total: int


class DashboardMessageCreate(BaseSchema):
    recipient_user_id: int
    title: str = ''
    message: str


class DashboardContactRead(BaseSchema):
    id: int
    email: str
    full_name: str | None = None
    role: str


class DashboardContactListResponse(BaseSchema):
    items: list[DashboardContactRead]
    total: int


class DashboardRecentQuoteRead(BaseSchema):
    id: int
    reference: str
    status: str
    total_ttc: float
    client_name: str


class DashboardResponse(BaseSchema):
    summary: DashboardSummaryRead
    calendar: DashboardCalendarRead
    tasks: list[DashboardTaskRead]
    events: list[DashboardEventRead]
    notifications: list[DashboardNotificationRead]
    recent_quotes: list[DashboardRecentQuoteRead]
