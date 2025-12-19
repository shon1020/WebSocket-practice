from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def App():
    return {"message": "Hello World"}
