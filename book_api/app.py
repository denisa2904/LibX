from fastapi import FastAPI, HTTPException
import subprocess
import os

app = FastAPI()


@app.post("/edit_recommendations/")
async def add_book():
    result = run_recommendation_script()
    if result is None:
        raise HTTPException(status_code=500, detail="Script execution failed")
    result = run_user_recs_script()
    if result is None:
        raise HTTPException(status_code=500, detail="Script execution failed")
    return {"status": "success"}


def run_recommendation_script():
    script_path = os.path.join(os.path.dirname(__file__), 'table_setup', 'recommendation.py')
    try:
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            check=True
        )
        print("Script stdout:", result.stdout)
        return 'true'
    except subprocess.CalledProcessError as e:
        print(f"Script execution failed: {e.stderr}")
        return None
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return None


def run_user_recs_script():
    script_path = os.path.join(os.path.dirname(__file__), 'table_setup', 'new_rec.py')
    try:
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            check=True
        )
        print("Script stdout:", result.stdout)
        return 'true'
    except subprocess.CalledProcessError as e:
        print(f"Script execution failed: {e.stderr}")
        return None
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return None


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
