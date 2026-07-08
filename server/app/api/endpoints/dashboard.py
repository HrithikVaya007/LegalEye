from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from app.db.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter()

def format_relative_time(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = now - dt
    if diff.days > 0:
        return f"{diff.days} days ago" if diff.days > 1 else "yesterday"
    hours = diff.seconds // 3600
    if hours > 0:
        return f"{hours} hours ago" if hours > 1 else "1 hour ago"
    minutes = diff.seconds // 60
    if minutes > 0:
        return f"{minutes} minutes ago" if minutes > 1 else "1 minute ago"
    return "just now"

@router.get("/stats")
async def get_dashboard_stats(
    db = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["_id"]
    user_name = current_user.get("full_name") or current_user.get("email", "User")
    
    # 1. Gather counts
    total_docs = await db.documents.count_documents({"user_id": user_id})
    total_queries = await db.queries.count_documents({"user_id": user_id})
    
    # Calculate storage size and chunk count
    cursor = db.documents.find({"user_id": user_id})
    total_bytes = 0
    total_chunks = 0
    async for doc in cursor:
        total_bytes += doc.get("size", 0)
        total_chunks += doc.get("chunks", 0)
        
    # Format storage size
    if total_bytes < 1024 * 1024:
        storage_str = f"{total_bytes / 1024:.1f} KB"
    elif total_bytes < 1024 * 1024 * 1024:
        storage_str = f"{total_bytes / (1024 * 1024):.1f} MB"
    else:
        storage_str = f"{total_bytes / (1024 * 1024 * 1024):.1f} GB"
        
    # 2. Compile weekly activity chart data (last 7 days)
    # Get counts per weekday
    chart_data = []
    today = datetime.utcnow()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, 0, 0, 0)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59)
        
        doc_count = await db.documents.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": day_start, "$lte": day_end}
        })
        
        query_count = await db.queries.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": day_start, "$lte": day_end}
        })
        
        chart_data.append({
            "name": day.strftime("%a"),
            "queries": query_count,
            "docs": doc_count
        })

    # 3. Compile recent activities
    recent_activities = []
    
    # Fetch 5 latest documents
    doc_cursor = db.documents.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    async for doc in doc_cursor:
        created = doc.get("created_at", datetime.utcnow())
        recent_activities.append({
            "user": user_name,
            "action": "Uploaded",
            "target": doc.get("filename", "document.pdf"),
            "time": format_relative_time(created),
            "timestamp": created
        })
        
    # Fetch 5 latest queries
    query_cursor = db.queries.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    async for q in query_cursor:
        created = q.get("created_at", datetime.utcnow())
        recent_activities.append({
            "user": user_name,
            "action": "Searched",
            "target": f'"{q.get("question", "")[:25]}..."' if len(q.get("question", "")) > 25 else f'"{q.get("question", "")}"',
            "time": format_relative_time(created),
            "timestamp": created
        })
        
    # Sort activities by timestamp descending
    recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
    # Remove timestamps for client response
    for act in recent_activities:
        act.pop("timestamp", None)
        
    # Standard response payload
    return {
        "stats": [
            { "label": "Total Documents", "value": str(total_docs), "change": "+0%" if total_docs == 0 else f"+{total_docs}", "trend": "up", "icon": "Files" },
            { "label": "AI Queries", "value": str(total_queries), "change": "+0%" if total_queries == 0 else f"+{total_queries}", "trend": "up", "icon": "MessageSquare" },
            { "label": "Avg. Response Time", "value": "0.6s" if total_queries > 0 else "0.0s", "change": "-0.2s" if total_queries > 0 else "0.0s", "trend": "down", "icon": "Clock" },
            { "label": "Storage Used", "value": storage_str, "change": "+0%", "trend": "up", "icon": "Database" }
        ],
        "chartData": chart_data,
        "recentActivity": recent_activities[:6] # Return top 6 activities
    }
