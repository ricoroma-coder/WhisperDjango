import json
from base64 import b64decode, b64encode
import whisper
import tempfile
import os
import openai

from django.shortcuts import render
from django.http import JsonResponse
from decouple import config
from gtts import gTTS
from pydub import AudioSegment

from resources.enums import Language


def home(request):
    return render(request, 'home.html')


def whisper_to_me(request):
    try:
        json_data = json.loads(request.body.decode('utf-8'))
        audio_file = json_data.get('data', None)
        audio = b64decode(audio_file)

        temp_file_path, object_transcribe = transcribe(audio)
        gpt_response = get_gpt_response(object_transcribe['text'])
        speech = text_to_speech(gpt_response, object_transcribe['language'])

        speech_file_path = create_temp_file()
        speech.save(speech_file_path)
        speech_base64 = encode_file_to_base64(speech_file_path)
        duration = get_audio_duration(speech_file_path)

        remove_temp_file(temp_file_path)
        remove_temp_file(speech_file_path)

        lang = object_transcribe['language'].upper()
        if lang in Language.__members__:
            lang = Language[lang].value
        else:
            lang = f'Not supported language ({lang})'

        return JsonResponse({
            'success': True,
            'request': {
                'transcribe': object_transcribe['text'],
                'language': lang
            },
            'response': {
                'gpt_response': gpt_response,
                'audio_base64': speech_base64,
                'audio_duration': duration
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def transcribe(audio):
    file_path = create_temp_file(audio)
    model = whisper.load_model(config('MODEL_TYPE'))
    object_transcribe = model.transcribe(file_path, fp16=False)
    return file_path, object_transcribe


def create_temp_file(file_content=None, extension='mp3'):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.' + extension) as temp_file:
        if file_content:
            temp_file.write(file_content)
        file_path = temp_file.name

    return file_path


def remove_temp_file(file_path):
    os.remove(file_path)


def get_gpt_response(text):
    openai.api_key = config('SECRET_KEY')
    response = openai.chat.completions.create(
        model=config('VERSION'),
        messages=[{
            'role': 'user',
            'content': text
        }]
    )

    return response.choices[0].message.content


def text_to_speech(text, language):
    return gTTS(text=text, lang=language, slow=False)


def encode_file_to_base64(file_path):
    with open(file_path, 'rb') as file:
        encoded_data = b64encode(file.read()).decode('utf-8')
    return encoded_data


def get_audio_duration(file_path):
    audio = AudioSegment.from_file(file_path)
    duration_in_seconds = len(audio) / 1000
    return duration_in_seconds
