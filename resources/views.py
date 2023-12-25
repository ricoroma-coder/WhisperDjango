import json
from base64 import b64decode

from django.shortcuts import render
from django.http import JsonResponse


def home(request):
    return render(request, 'home.html')


def whisper(request):
    try:
        json_data = json.loads(request.body.decode('utf-8'))
        audio_file = json_data.get('data', None)
        audio = b64decode(audio_file)

        return JsonResponse({'message': 'Upload bem-sucedido'})
    except Exception as e:
        print(str(e))
        return JsonResponse({'error': str(e)})
