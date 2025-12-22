from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from logging import getLogger
from starlette.websockets import WebSocketState
from typing import List
import asyncio

app = FastAPI()

logger = getLogger("websocket_server")

# 複数人の接続を管理するためのクラス
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        data = {
            "text": message,
            "type": "personal"
        }
        await websocket.send_json(data)

    async def receive_text(self, websocket: WebSocket) -> str:
        data = await websocket.receive_text()
        return data

manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse("<h1>WebSocket is running</h1>")

#websocketエンドポイント作成
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    #コネクションを受け入れる
    await manager.connect(websocket)
    logger.info(f"クライアント{client_id}が接続しました")
    try:
        send_task = asyncio.create_task(send_messages_periodically(websocket))
        while True:
            data = await manager.receive_text(websocket)
            logger.info(f"クライアント{client_id}からメッセージを受け取りました: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.warning(f"クライアント{client_id}が切断されました")
    except Exception as e:
        logger.error(f"予期しないエラーが発生しました: {e}")

    finally:
        send_task.cancel()
        await websocket.close()
        logger.info("WebSocket接続が終了しました")

async def send_messages_periodically(websocket: WebSocket):
    for i in range(100):
        if websocket.application_state != WebSocketState.CONNECTED:
            break
        await websocket.send_text(f"test text No.{i}")
        await asyncio.sleep(0.05)