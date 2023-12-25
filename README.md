# WhisperDjango
This awesome project implements OpenAI Whisper to a web application developed with Django and Javascript (jQuery). Try it!

## Project Install
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    pip install git+https://github.com/openai/whisper.git -q
    pip install --upgrade --no-deps --force-reinstall git+https://github.com/openai/whisper.git

## Whisper install
- Check README.md on:

    https://github.com/openai/whisper

## IMPORTANT
- Rename your .env_example to .env;
- Replace data with your ChatGPT secret key;
- Adjust MODEL_TYPE as you like;

  *OBS:* Remember, if you change MODEL_TYPE, it may affect your performance. Be careful!

# Run local server
- python manage.py runserver
