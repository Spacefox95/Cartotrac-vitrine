from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal

from src.core.config import settings
from src.domains.clients.models import Client
from src.domains.quotes.models import Quote


@dataclass
class QuotePdfDocument:
    filename: str
    content: bytes


class PdfTextCanvas:
    def __init__(self) -> None:
        self.commands: list[str] = []

    def add_text(
        self,
        x: int,
        y: int,
        text: str,
        *,
        font: str = 'F1',
        size: int = 11,
    ) -> None:
        if not text.strip():
            return

        escaped = (
            text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        )
        self.commands.append(f'BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({escaped}) Tj ET')

    def add_line(
        self,
        start_x: int,
        start_y: int,
        end_x: int,
        end_y: int,
        *,
        width: float = 1,
    ) -> None:
        self.commands.append(f'{width:.2f} w {start_x} {start_y} m {end_x} {end_y} l S')

    def render(self) -> bytes:
        payload = '\n'.join(self.commands).encode('cp1252', errors='replace')
        return payload


def render_quote_pdf(quote: Quote, client: Client) -> QuotePdfDocument:
    created_at = datetime.now()
    expires_at = created_at + timedelta(days=settings.quote_validity_days)
    canvas = PdfTextCanvas()

    canvas.add_text(50, 790, settings.quote_pdf_company_name, font='F2', size=22)
    canvas.add_text(50, 770, 'Devis commercial', font='F2', size=16)
    canvas.add_text(50, 748, settings.quote_pdf_company_address)
    canvas.add_text(
        50,
        732,
        f'{settings.quote_pdf_company_email}  |  {settings.quote_pdf_company_phone}',
    )
    canvas.add_line(50, 718, 545, 718, width=1.4)

    canvas.add_text(50, 690, 'Client', font='F2', size=13)
    canvas.add_text(50, 672, client.company_name, font='F2', size=12)
    canvas.add_text(50, 656, client.contact_name or 'Contact non renseigne')
    canvas.add_text(50, 640, client.email or 'Email non renseigne')
    canvas.add_text(50, 624, client.phone or 'Telephone non renseigne')

    canvas.add_text(330, 690, 'Informations devis', font='F2', size=13)
    canvas.add_text(330, 672, f'Reference : {quote.reference}')
    canvas.add_text(330, 656, f'Statut : {quote.status}')
    canvas.add_text(330, 640, f'Date d emission : {format_date(created_at)}')
    canvas.add_text(330, 624, f'Validite : {format_date(expires_at)}')

    canvas.add_line(50, 604, 545, 604)

    canvas.add_text(50, 580, 'Synthese', font='F2', size=13)
    canvas.add_text(50, 560, f'Total HT : {format_currency(quote.total_ht)}', font='F2', size=12)
    canvas.add_text(50, 542, f'Total TTC : {format_currency(quote.total_ttc)}', font='F2', size=12)

    next_y = 510
    cadastre_context = quote.cadastre_context or {}
    if cadastre_context:
        canvas.add_text(50, next_y, 'Contexte cadastre', font='F2', size=13)
        next_y -= 20

        cadastre_lines = [
            cadastre_context.get('address_label'),
            format_cadastre_parcels(cadastre_context),
            format_cadastre_area(cadastre_context),
        ]
        for line in cadastre_lines:
            if line:
                canvas.add_text(50, next_y, line)
                next_y -= 16

        next_y -= 6

    canvas.add_text(50, next_y, 'Observation', font='F2', size=13)
    next_y -= 20
    notes = [
        "Document genere automatiquement par Cartotrac.",
        'Le montant final peut etre ajuste selon releve terrain et validation client.',
        'Pour toute question, repondez directement a ce devis ou contactez notre equipe.',
    ]
    for note in notes:
        canvas.add_text(50, next_y, f'- {note}')
        next_y -= 16

    canvas.add_line(50, 92, 545, 92)
    canvas.add_text(
        50,
        72,
        f'{settings.quote_pdf_company_name}  |  {settings.quote_pdf_company_email}  |  {settings.quote_pdf_company_phone}',
        size=10,
    )

    return QuotePdfDocument(
        filename=build_pdf_filename(quote.reference),
        content=build_single_page_pdf(canvas.render()),
    )


def build_pdf_filename(reference: str) -> str:
    safe_reference = ''.join(
        character if character.isalnum() or character in {'-', '_'} else '-'
        for character in reference.strip()
    ) or 'devis'
    return f'{safe_reference}.pdf'


def build_single_page_pdf(content_stream: bytes) -> bytes:
    objects = [
        b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        (
            b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] '
            b'/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'
        ),
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
        f'<< /Length {len(content_stream)} >>\nstream\n'.encode('ascii')
        + content_stream
        + b'\nendstream',
    ]

    pdf = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f'{index} 0 obj\n'.encode('ascii'))
        pdf.extend(obj)
        pdf.extend(b'\nendobj\n')

    xref_offset = len(pdf)
    pdf.extend(f'xref\n0 {len(objects) + 1}\n'.encode('ascii'))
    pdf.extend(b'0000000000 65535 f \n')
    for offset in offsets[1:]:
        pdf.extend(f'{offset:010d} 00000 n \n'.encode('ascii'))

    pdf.extend(
        (
            f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n'
            f'startxref\n{xref_offset}\n%%EOF'
        ).encode('ascii')
    )
    return bytes(pdf)


def format_currency(value: Decimal | float | int) -> str:
    amount = Decimal(value)
    normalized = amount.quantize(Decimal('0.01'))
    return f'{normalized} EUR'


def format_date(value: datetime) -> str:
    return value.strftime('%d/%m/%Y')


def format_cadastre_parcels(cadastre_context: dict) -> str | None:
    title = cadastre_context.get('parcel_title')
    subtitle = cadastre_context.get('parcel_subtitle')

    if not title:
        return None

    if subtitle:
        return f'Parcelle : {title} | {subtitle}'

    return f'Parcelle : {title}'


def format_cadastre_area(cadastre_context: dict) -> str | None:
    trace_area = cadastre_context.get('trace_area_sqm')
    parcel_area = cadastre_context.get('parcel_area_label')

    if trace_area is not None:
        return f'Surface retenue : {trace_area} m2'

    if parcel_area:
        return f'Surface cadastrale indicative : {parcel_area}'

    return None
