from qdrant_client.models import FieldCondition, Filter, MatchAny

from app.models.schemas.chat import RetrievalFilters


def build_qdrant_filter(filters: RetrievalFilters | None) -> Filter | None:
    if not filters:
        return None
    must: list[FieldCondition] = []
    if filters.file_ids:
        must.append(
            FieldCondition(key="file_id", match=MatchAny(any=filters.file_ids))
        )
    if filters.tags:
        must.append(
            FieldCondition(key="tags", match=MatchAny(any=filters.tags))
        )
    if filters.models:
        must.append(
            FieldCondition(key="model", match=MatchAny(any=filters.models))
        )
    if not must:
        return None
    return Filter(must=must)
