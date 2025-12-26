FROM python:3.13-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.9.13 /uv /uvx /bin/

WORKDIR /app

COPY python-server/pyproject.toml .
COPY python-server/uv.lock .
COPY python-server/.python-version .

RUN uv sync --locked

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

