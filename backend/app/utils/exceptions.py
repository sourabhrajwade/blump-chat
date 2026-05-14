"""Application-level errors (mapped to HTTP responses by handlers)."""


class AppError(Exception):
    """Base error with stable machine code and HTTP status."""

    def __init__(
        self,
        message: str,
        *,
        code: str = "app_error",
        status_code: int = 400,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found", *, code: str = "not_found") -> None:
        super().__init__(message, code=code, status_code=404)


class ValidationError(AppError):
    def __init__(self, message: str, *, code: str = "validation_error") -> None:
        super().__init__(message, code=code, status_code=422)


class UpstreamError(AppError):
    def __init__(self, message: str, *, code: str = "upstream_error") -> None:
        super().__init__(message, code=code, status_code=502)
