## To work on this project

- Python Version `3.12.3` 
- `python3 -m venv .venv`
- `source .venv/bin/activate`
- `pip3 install -r requirements.txt`

## To run the server

```python
uvicorn main:app --reload
```

## Code consistency 

- After installing packages, run `pip freeze > requirements.txt` and commit this file to your git repository. Everyone else should install from this file using `pip3 install -r requirements.txt`
- Run `black .` in your project directory before commits for code formatting.
- Run `ruff check --fix .` to automatically fix common issues and linting before commits.

Todo : @Risshi add a precommit hook to run above before commits automatically
