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
    return f"""
import matplotlib.pyplot as plt
import io, base64, matplotlib, sys
from PIL import Image
matplotlib.use('Agg')

# Fiksiramo parametre za identičan render pre nego što đak krene da kuca
plt.rcParams['figure.dpi'] = 100
plt.rcParams['figure.figsize'] = [6.4, 4.8]

def custom_show():
    # Proveravamo da li uopšte postoji nacrtana figura
    if plt.get_fignums():
        tmp_buf = io.BytesIO()
        plt.savefig(tmp_buf, format='png')
        tmp_buf.seek(0)
        
        # Čišćenje slike preko Pillow-a za statički Base64
        img = Image.open(tmp_buf).convert('RGB')
        clean_buf = io.BytesIO()
        img.save(clean_buf, format='png', optimize=False)
        clean_buf.seek(0)
        
        b64_str = base64.b64encode(clean_buf.read()).decode('utf-8')
        print(f"---IMG_START---{{b64_str}}---IMG_END---")
        plt.close('all')

# KLJUČ: Menjamo standardni plt.show našom funkcijom
plt.show = custom_show

try:
{chr(10).join(['    ' + line for line in user_code.splitlines()])}
except Exception as e:
    print(f"ERROR: {{e}}", file=sys.stderr)
"""

@app.post("/run")
async def run_python_code(req: CodeRequest):
    async with execution_lock:
        filename = f"exec_{uuid.uuid4()}.py"
        with open(filename, "w") as f:
            f.write(wrap_code(req.code))

        try:
            proc = subprocess.Popen(
                ["python3", filename],
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

            image_data = None
            if "---IMG_START---" in stdout:
                parts = stdout.split("---IMG_START---")
                pre_img_stdout = parts[0]
                img_and_rest = parts[1].split("---IMG_END---")
                image_data = img_and_rest[0]
                post_img_stdout = img_and_rest[1] if len(img_and_rest) > 1 else ""
                stdout = pre_img_stdout + post_img_stdout

            # Ako je proces "ubijen" zbog memorije, stderr će često biti prazan ili javiti MemoryError
            return {
                "stdout": stdout.strip(),
                "stderr": stderr.strip(),
                "image_b64": image_data,
                "exit_code": proc.returncode
            }
        finally:
            if os.path.exists(filename): os.remove(filename)