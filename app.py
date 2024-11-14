from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
import asyncio
import os
from typing import Dict, List

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Voice models dictionary
VOICES = {
    "English": {
        "US": {
            "Emma": "en-US-EmmaNeural",
            "Jenny": "en-US-JennyNeural",
            "Guy": "en-US-GuyNeural",
            "Aria": "en-US-AriaNeural",
            "Davis": "en-US-DavisNeural",
        },
        "UK": {
            "Jane": "en-GB-SoniaNeural",
            "Ryan": "en-GB-RyanNeural",
        },
        "AU": {
            "Libby": "en-AU-NatashaNeural",
            "William": "en-AU-WilliamNeural",
        }
    },
    "Indian": {
        "Hindi": {
            "Swara": "hi-IN-SwaraNeural",
            "Madhur": "hi-IN-MadhurNeural",
        },
        "Tamil": {
            "Pallavi": "ta-IN-PallaviNeural",
            "Valluvar": "ta-IN-ValluvarNeural",
        },
        "Telugu": {
            "Mohan": "te-IN-MohanNeural",
            "Shruti": "te-IN-ShrutiNeural",
        }
    },
    "Multi": {
        "Multilingual": {
            "Emma": "en-US-EmmaMultilingualNeural",
            "Guy": "fr-FR-VivienneMultilingualNeural",
            "Ava": "en-US-AvaMultilingualNeural",
        }
    }
}

class TTSRequest(BaseModel):
    text: str
    voice: str

@app.get("/api/voices")
async def get_voices():
    return JSONResponse(content=VOICES)

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # Generate a unique filename
        filename = f"output_{os.urandom(8).hex()}.mp3"
        
        # Create TTS
        communicate = edge_tts.Communicate(request.text, voice=request.voice)
        await communicate.save(filename)
        
        # Return the audio file
        response = FileResponse(
            filename,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
        # Delete the file after sending
        async def delete_file():
            await asyncio.sleep(1)
            try:
                os.remove(filename)
            except:
                pass
        
        asyncio.create_task(delete_file())
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
