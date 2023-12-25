import json
from base64 import b64decode
import whisper
import tempfile
import os

from django.shortcuts import render
from django.http import JsonResponse


def home(request):
    return render(request, 'home.html')


def whisper_api(request):
    try:
        json_data = json.loads(request.body.decode('utf-8'))
        audio_file = json_data.get('data', None)
        audio = b64decode(audio_file)

        temp_file_path, object_transcribe = transcribe(audio)
        remove_temp_file(temp_file_path)
        return JsonResponse({'message': 'Upload bem-sucedido', 'response': object_transcribe})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def transcribe(audio):
    file_path = create_temp_file(audio)

    # henrique ao pegar o modelo, criar enum para os tipos de modelo
    # tiny, base, small, medium, large
    model = whisper.load_model("small")
    object_transcribe = model.transcribe(file_path, fp16=False)
    return file_path, object_transcribe


def create_temp_file(file_content):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(file_content)
        file_path = temp_file.name

    return file_path


def remove_temp_file(file_path):
    os.remove(file_path)
