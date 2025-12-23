FROM python:3.13-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.9.13 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml .
COPY uv.lock .
COPY .python-version .

RUN uv sync --locked

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--reload"]

