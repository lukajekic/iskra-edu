import subprocess
import os
import base64
import uuid
import asyncio
import resource
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
execution_lock = asyncio.Semaphore(2) # Queue: dozvoljava 2 paralelna run-a

class CodeRequest(BaseModel):
    code: str
    input_data: str = ""
    timeout: int = 15

def set_limits():
    # Ograničavamo memoriju na 512MB (u bajtovima)
    mem_limit = 512 * 1024 * 1024 
    resource.setrlimit(resource.RLIMIT_AS, (mem_limit, mem_limit))

def wrap_code(user_code):
    # Pakujemo Ruby kod u begin-rescue blok da bi uhvatili runtime greške i poslali ih na stderr
    return f"""begin
{chr(10).join(['  ' + line for line in user_code.splitlines()])}
rescue Exception => e
  $stderr.puts "ERROR: #{{e.message}}"
end"""

@app.post("/run")
async def run_ruby_code(req: CodeRequest):
    async with execution_lock:
        # Menjamo ekstenziju u .rb za Ruby
        filename = f"exec_{uuid.uuid4()}.rb"
        with open(filename, "w") as f:
            f.write(wrap_code(req.code))
            
        try:
            # Pokrećemo proces sa "ruby" komandom umesto "python3"
            proc = subprocess.Popen(
                ["ruby", filename],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=set_limits # OVDE se setuje RAM limit pre starta
            )
            
            try:
                stdout, stderr = proc.communicate(input=req.input_data, timeout=req.timeout)
            except subprocess.TimeoutExpired:
                proc.kill()
                return {"error": "Timeout", "stderr": "Prekoračeno vreme rada."}
            
            # Pošto nema matplotlib-a, image_data je uvek None, ali struktura ostaje ista
            image_data = None
            
            return {
                "stdout": stdout, 
                "stderr": stderr.strip(),
                "image_b64": image_data, 
                "exit_code": proc.returncode
            }
            
        finally:
            if os.path.exists(filename): 
                os.remove(filename)