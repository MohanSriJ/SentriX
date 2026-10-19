from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from backend.app.core.database import get_db
from backend.app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_report_summary(type: str = "daily", db: Session = Depends(get_db)):
    return ReportService.generate_data_summary(db, type)

@router.get("/export/csv")
def export_report_csv(data_type: str = "alerts", db: Session = Depends(get_db)):
    csv_str = ReportService.export_csv(db, data_type)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sentrix_{data_type}_export.csv"}
    )

@router.get("/export/pdf")
def export_report_pdf(type: str = "daily", db: Session = Depends(get_db)):
    pdf_bytes = ReportService.export_pdf(db, type)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=sentrix_{type}_safety_report.pdf"}
    )
